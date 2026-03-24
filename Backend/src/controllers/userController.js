const db = require("../models/db");
const { sendEmail } = require("../utils/emailService");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { JWT_SECRET } = require("../middleware/auth");
const { uploadToCloudinary, destroyFromCloudinary } = require("../utils/cloudinary");

let OAuth2Client = null;
try {
  ({ OAuth2Client } = require("google-auth-library"));
} catch (err) {
  OAuth2Client = null;
}

const googleClient = OAuth2Client
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID || undefined)
  : null;
const getFrontendBaseUrl = () =>
  String(process.env.FRONTEND_URL || process.env.FRONTEND_URLS || "http://localhost:3000")
    .split(",")[0]
    .trim();

const signToken = (user) =>
  jwt.sign(
    { id: Number(user.id), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// ---------- REGISTER ----------
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedRole = role === "RECRUITER" || role === "ADMIN" ? role : "USER";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const passwordHash = bcrypt.hashSync(String(password), 10);

  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, passwordHash, normalizedRole], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already exists" });
      }
      return res.status(500).json({ message: "Register failed" });
    }

    sendEmail({
      to: email,
      subject: "Welcome to JobSphere - Registration Successful",
      text: `Hi ${name}, welcome to JobSphere. Your registration is successful.`,
    }).catch(() => {});

    const user = {
      id: result.insertId,
      name,
      email,
      role: normalizedRole,
    };

    res.json({
      message: "Registered successfully",
      user,
      token: signToken(user),
    });
  });
};

// ---------- GOOGLE AUTH ----------
exports.googleAuth = async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  if (!googleClient) {
    return res.status(500).json({ message: "google-auth-library not installed in backend" });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured in backend" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || "Google User";

    if (!email) {
      return res.status(400).json({ message: "Unable to read email from Google account" });
    }

    const findSql = "SELECT id, name, email, role FROM users WHERE email = ? LIMIT 1";

    db.query(findSql, [email], (findErr, existingRows) => {
      if (findErr) return res.status(500).json(findErr);

      if (existingRows.length > 0) {
        const user = existingRows[0];
        return res.json({ user, message: "Logged in with Google", token: signToken(user) });
      }

      const finalRole = role === "RECRUITER" ? "RECRUITER" : "USER";
      const generatedPassword = `GOOGLE_${crypto.randomBytes(8).toString("hex")}`;
      const generatedPasswordHash = bcrypt.hashSync(generatedPassword, 10);
      const insertSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

      db.query(insertSql, [name, email, generatedPasswordHash, finalRole], (insertErr, result) => {
        if (insertErr) {
          if (insertErr.code === "ER_DUP_ENTRY") {
            db.query(findSql, [email], (refetchErr, rows) => {
              if (refetchErr) return res.status(500).json(refetchErr);
              const user = rows[0];
              return res.json({ user, message: "Logged in with Google", token: signToken(user) });
            });
            return;
          }

          return res.status(500).json(insertErr);
        }

        const user = {
          id: result.insertId,
          name,
          email,
          role: finalRole,
        };

        sendEmail({
          to: email,
          subject: "Welcome to JobSphere - Registration Successful",
          text: `Hi ${name}, welcome to JobSphere. Your registration is successful.`,
        }).catch(() => {});

        return res.json({ user, message: "Registered and logged in with Google", token: signToken(user) });
      });
    });
  } catch (err) {
    return res.status(401).json({ message: "Google sign-in verification failed" });
  }
};

// ---------- LOGIN ----------
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT id, name, email, role, password
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const row = results[0];
    const storedPassword = String(row.password || "");

    let isValid = false;
    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
      isValid = bcrypt.compareSync(String(password || ""), storedPassword);
    } else {
      // Backward compatibility: upgrade legacy plain-text passwords on successful login.
      isValid = storedPassword === String(password || "");
      if (isValid) {
        const upgradedHash = bcrypt.hashSync(String(password), 10);
        db.query("UPDATE users SET password = ? WHERE id = ?", [upgradedHash, row.id], () => {});
      }
    }

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
    };
    res.json({ user, token: signToken(user) });
  });
};

exports.forgotPassword = (req, res) => {
  const email = String(req.body?.email || "").trim();

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const findSql = "SELECT id, name, email FROM users WHERE email = ? LIMIT 1";

  db.query(findSql, [email], (findErr, rows) => {
    if (findErr) return res.status(500).json({ message: "Unable to process password reset" });

    if (!rows || rows.length === 0) {
      return res.json({ message: "If this email exists, a reset link has been sent." });
    }

    const user = rows[0];
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const resetLink = `${getFrontendBaseUrl()}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    db.query(
      "UPDATE users SET reset_password_token = ?, reset_password_expires_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?",
      [tokenHash, user.id],
      async (updateErr) => {
        if (updateErr) return res.status(500).json({ message: "Unable to process password reset" });

        await sendEmail({
          to: email,
          subject: "JobSphere Password Reset",
          text: `Hi ${user.name}, use this link to reset your JobSphere password: ${resetLink}`,
        }).catch(() => {});

        return res.json({ message: "If this email exists, a reset link has been sent." });
      }
    );
  });
};

exports.resetPassword = (req, res) => {
  const email = String(req.body?.email || "").trim();
  const token = String(req.body?.token || "").trim();
  const newPassword = String(req.body?.password || "");

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: "Email, token and new password are required" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const newPasswordHash = bcrypt.hashSync(newPassword, 10);
  const sql = `
    UPDATE users
    SET password = ?, reset_password_token = NULL, reset_password_expires_at = NULL
    WHERE email = ?
      AND reset_password_token = ?
      AND reset_password_expires_at IS NOT NULL
      AND reset_password_expires_at >= NOW()
  `;

  db.query(sql, [newPasswordHash, email, tokenHash], (err, result) => {
    if (err) return res.status(500).json({ message: "Unable to reset password" });

    if (!result.affectedRows) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    return res.json({ message: "Password reset successful" });
  });
};

// ---------- GET ALL USERS ----------
exports.getAllUsers = (req, res) => {
  db.query(
    "SELECT id, name, email, role FROM users",
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching users" });
      }
      res.json(result);
    }
  );
};

// ---------- DELETE USER ----------
exports.deleteUser = (req, res) => {
  const userId = Number(req.params.id);

  const cleanupQueries = [
    "DELETE FROM applications WHERE user_id = ?",
    "DELETE FROM applications WHERE job_id IN (SELECT id FROM jobs WHERE recruiter_id = ?)",
    "DELETE FROM resumes WHERE user_id = ?",
    "DELETE FROM jobs WHERE recruiter_id = ?",
    "DELETE FROM users WHERE id = ?",
  ];

  let index = 0;

  const runNext = () => {
    if (index >= cleanupQueries.length) {
      return res.json({ message: "Account deleted permanently" });
    }

    db.query(cleanupQueries[index], [userId], (err) => {
      if (err) {
        return res.status(500).json({ message: "Delete failed", error: err.message });
      }

      index += 1;
      runNext();
    });
  };

  runNext();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!String(file.mimetype || "").startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
}).single("photo");

// UPLOAD PROFILE PHOTO
exports.uploadProfilePhoto = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    const userId = Number(req.body?.userId);
    const requesterId = Number(req.authUser?.id);
    const requesterRole = req.authUser?.role;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (requesterRole !== "ADMIN" && requesterId !== userId) {
      return res.status(403).json({ message: "You can update only your own profile photo" });
    }

    if (!req.file) return res.status(400).json({ message: "No file" });

    try {
      const existingUser = await new Promise((resolve, reject) => {
        db.query(
          "SELECT profile_photo_public_id FROM users WHERE id = ? LIMIT 1",
          [userId],
          (dbErr, rows) => {
            if (dbErr) return reject(dbErr);
            resolve(rows?.[0] || null);
          }
        );
      });

      const uploadedPhoto = await uploadToCloudinary({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype || "image/jpeg",
        folder: "jobsphere/profile",
        publicId: `profile-${userId}-${Date.now()}`,
        resourceType: "image",
      });

      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE users SET profile_photo = ?, profile_photo_public_id = ? WHERE id = ?",
          [uploadedPhoto.secure_url, uploadedPhoto.public_id, userId],
          (dbErr) => {
            if (dbErr) return reject(dbErr);
            resolve();
          }
        );
      });

      if (existingUser?.profile_photo_public_id) {
        destroyFromCloudinary({
          publicId: existingUser.profile_photo_public_id,
          resourceType: "image",
        }).catch(() => {});
      }

      res.json({ filename: uploadedPhoto.secure_url, url: uploadedPhoto.secure_url });
    } catch (uploadErr) {
      return res.status(500).json({ message: uploadErr.message || "Profile photo upload failed" });
    }
  });
};

exports.deleteProfilePhoto = async (req, res) => {
  const userId = Number(req.params.id || req.body?.userId);
  const requesterId = Number(req.authUser?.id);
  const requesterRole = req.authUser?.role;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (requesterRole !== "ADMIN" && requesterId !== userId) {
    return res.status(403).json({ message: "You can delete only your own profile photo" });
  }

  try {
    const existingUser = await new Promise((resolve, reject) => {
      db.query(
        "SELECT profile_photo_public_id FROM users WHERE id = ? LIMIT 1",
        [userId],
        (dbErr, rows) => {
          if (dbErr) return reject(dbErr);
          resolve(rows?.[0] || null);
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET profile_photo = NULL, profile_photo_public_id = NULL WHERE id = ?",
        [userId],
        (dbErr) => {
          if (dbErr) return reject(dbErr);
          resolve();
        }
      );
    });

    if (existingUser?.profile_photo_public_id) {
      destroyFromCloudinary({
        publicId: existingUser.profile_photo_public_id,
        resourceType: "image",
      }).catch(() => {});
    }

    return res.json({ message: "Profile photo deleted" });
  } catch (deleteErr) {
    return res.status(500).json({ message: deleteErr.message || "Failed to delete profile photo" });
  }
};

exports.getUserProfile = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      id, name, email, role,
      profile_photo, dob, father_name, phone, address, github_url, linkedin_url
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message || "Failed to load profile" });
    res.json(result[0] || null);
  });
};
exports.updateProfile = (req, res) => {
  const { id } = req.params;
  const { dob, father_name, phone, address, github_url, linkedin_url } = req.body;

  // MySQL DATE must be YYYY-MM-DD or NULL (empty string causes 500)
  const normalizedDob =
    dob && /^\d{4}-\d{2}-\d{2}$/.test(dob) ? dob : null;

  const sql = `
    UPDATE users
    SET dob=?, father_name=?, phone=?, address=?, github_url=?, linkedin_url=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      normalizedDob,
      father_name || null,
      phone || null,
      address || null,
      github_url || null,
      linkedin_url || null,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ message: "Profile update failed", error: err.message });
      res.json({ message: "Profile updated" });
    }
  );
};

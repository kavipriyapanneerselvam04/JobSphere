const db = require("../models/db");
const multer = require("multer");
const { uploadToCloudinary, destroyFromCloudinary } = require("../utils/cloudinary");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".pdf")) {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
}).single("resume");

exports.uploadResume = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const userId = Number(req.body?.user_id);
    const skills = String(req.body?.skills || "").trim();
    const experience = Number(req.body?.experience || 0);
    const requesterId = Number(req.authUser?.id);
    const requesterRole = req.authUser?.role;

    if (!userId || !skills) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (requesterRole !== "ADMIN" && requesterId !== userId) {
      return res.status(403).json({ message: "You can upload resume only for your account" });
    }

    try {
      const existingResume = await new Promise((resolve, reject) => {
        db.query(
          "SELECT id, file_name, cloudinary_public_id FROM resumes WHERE user_id = ? LIMIT 1",
          [userId],
          (dbErr, results) => {
            if (dbErr) return reject(dbErr);
            resolve(results?.[0] || null);
          }
        );
      });

      let uploadedResume = null;
      if (req.file) {
        uploadedResume = await uploadToCloudinary({
          buffer: req.file.buffer,
          mimeType: req.file.mimetype || "application/pdf",
          folder: "jobsphere/resumes",
          publicId: `resume-${userId}-${Date.now()}`,
          resourceType: "raw",
        });
      }

      const sql = `
        INSERT INTO resumes (
          user_id,
          skills,
          experience,
          file_name,
          original_file_name,
          cloudinary_public_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          skills = VALUES(skills),
          experience = VALUES(experience),
          file_name = COALESCE(VALUES(file_name), file_name),
          original_file_name = COALESCE(VALUES(original_file_name), original_file_name),
          cloudinary_public_id = COALESCE(VALUES(cloudinary_public_id), cloudinary_public_id)
      `;

      await new Promise((resolve, reject) => {
        db.query(
          sql,
          [
            userId,
            skills,
            Number.isNaN(experience) ? 0 : experience,
            uploadedResume?.secure_url || null,
            req.file?.originalname || null,
            uploadedResume?.public_id || null,
          ],
          (dbErr) => {
            if (dbErr) return reject(dbErr);
            resolve();
          }
        );
      });

      if (uploadedResume?.public_id && existingResume?.cloudinary_public_id) {
        destroyFromCloudinary({
          publicId: existingResume.cloudinary_public_id,
          resourceType: "raw",
        }).catch(() => {});
      }

      return res.json({
        message: "Resume uploaded successfully",
        resume: {
          user_id: userId,
          skills,
          experience: Number.isNaN(experience) ? 0 : experience,
          resume_file: uploadedResume?.secure_url || existingResume?.file_name || null,
          resume_url: uploadedResume?.secure_url || existingResume?.file_name || null,
          original_file_name: req.file?.originalname || null,
        },
      });
    } catch (uploadErr) {
      return res.status(500).json({ message: uploadErr.message || "Resume upload failed" });
    }
  });
};

exports.getResumeByUser = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      id,
      user_id,
      skills,
      experience,
      file_name AS resume_file,
      file_name AS resume_url,
      original_file_name,
      updated_at
    FROM resumes
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message || "Failed to load resume" });
    res.json(results[0] || null);
  });
};

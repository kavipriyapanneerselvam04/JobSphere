
const db = require("../models/db");
const multer = require("multer");
const path = require("path");

// Store resumes in Backend/src/uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".pdf")) {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
}).single("resume");

exports.uploadResume = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const user_id = req.body?.user_id;
    const skills = req.body?.skills;
    const experience = Number(req.body?.experience || 0);
    const resumeFile = req.file ? req.file.filename : null;

    if (!user_id || !skills) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const requesterId = Number(req.authUser?.id);
    const requesterRole = req.authUser?.role;

    if (requesterRole !== "ADMIN" && requesterId !== Number(user_id)) {
      return res.status(403).json({ message: "You can upload resume only for your account" });
    }

    const sql = `
      INSERT INTO resumes (user_id, skills, experience, file_name)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        skills = VALUES(skills),
        experience = VALUES(experience),
        file_name = COALESCE(VALUES(file_name), file_name)
    `;

    db.query(sql, [user_id, skills, experience, resumeFile], (dbErr) => {
      if (dbErr) return res.status(500).json(dbErr);
      res.json({ message: "Resume uploaded successfully" });
    });
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
      file_name AS resume_file
    FROM resumes
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0] || null);
  });
};

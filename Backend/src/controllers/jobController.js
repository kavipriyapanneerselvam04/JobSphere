const db = require("../models/db");
const { sendEmail } = require("../utils/emailService");

exports.addJob = (req, res) => {
  const { recruiter_id, title, skills, description } = req.body;

  if (!title || !skills || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO jobs (recruiter_id, title, skills, description)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [recruiter_id || null, title, skills, description], (err) => {
    if (err) return res.status(500).json(err);

    if (recruiter_id) {
      db.query(
        "SELECT name, email FROM users WHERE id = ? LIMIT 1",
        [recruiter_id],
        (userErr, rows) => {
          if (!userErr && rows?.[0]?.email) {
            const recruiter = rows[0];
            sendEmail({
              to: recruiter.email,
              subject: `JobSphere: Job posted successfully for ${title}`,
              text: `Hi ${recruiter.name || "Recruiter"}, your job "${title}" has been posted successfully on JobSphere.`,
            }).catch(() => {});
          }
        }
      );
    }

    res.json({ message: "Job added successfully" });
  });
};

exports.getAllJobs = (req, res) => {
  db.query(
    "SELECT id, recruiter_id, title, skills, description FROM jobs ORDER BY id DESC",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.matchJobs = (req, res) => {
  const { userId } = req.params;

  db.query(
    "SELECT skills FROM resumes WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [userId],
    (err, resumeResult) => {
      if (err) return res.status(500).json(err);

      if (!resumeResult || resumeResult.length === 0) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const resumeSkills = resumeResult[0].skills
        .toLowerCase()
        .split(/[,\s]+/)
        .filter(Boolean);

      if (resumeSkills.length === 0) {
        return res.json([]);
      }

      const conditions = resumeSkills.map(() => "LOWER(skills) LIKE ?").join(" OR ");
      const values = resumeSkills.map((s) => `%${s}%`);

      const sql = `
        SELECT id, title, skills, description
        FROM jobs
        WHERE ${conditions}
      `;

      db.query(sql, values, (jobErr, jobs) => {
        if (jobErr) return res.status(500).json(jobErr);
        res.json(jobs);
      });
    }
  );
};

exports.applyForJob = (req, res) => {
  const {
    user_id,
    job_id,
    name,
    email,
    phone,
    location,
    linkedIn,
    portfolio,
    experienceYears,
    expectedSalary,
    noticePeriod,
    workMode,
    relocate,
    coverLetter,
  } = req.body;

  if (!user_id || !job_id || !name || !email || !phone || !location) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const getJobSql = `
    SELECT j.id, j.title, j.recruiter_id, u.email AS recruiter_email, u.name AS recruiter_name
    FROM jobs j
    LEFT JOIN users u ON u.id = j.recruiter_id
    WHERE j.id = ?
    LIMIT 1
  `;

  db.query(getJobSql, [job_id], (jobErr, jobRows) => {
    if (jobErr) return res.status(500).json(jobErr);
    if (!jobRows || jobRows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = jobRows[0];

    const insertSql = `
      INSERT INTO applications (
        job_id,
        user_id,
        name,
        email,
        phone,
        location,
        linkedin,
        portfolio,
        experience_years,
        expected_salary,
        notice_period,
        work_mode,
        relocate,
        cover_letter,
        status,
        status_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL)
    `;

    const values = [
      Number(job_id),
      Number(user_id),
      name,
      email,
      phone,
      location,
      linkedIn || null,
      portfolio || null,
      Number(experienceYears || 0),
      expectedSalary || null,
      noticePeriod || null,
      workMode || null,
      relocate ? 1 : 0,
      coverLetter || null,
    ];

    db.query(insertSql, values, async (insertErr) => {
      if (insertErr) {
        if (insertErr.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "You have already applied for this job" });
        }
        return res.status(500).json(insertErr);
      }

      sendEmail({
        to: email,
        subject: `JobSphere: Application received for ${job.title}`,
        text: `Hi ${name}, your application for \"${job.title}\" has been received successfully on JobSphere.`
      }).catch(() => {});

      if (job.recruiter_email) {
        sendEmail({
          to: job.recruiter_email,
          subject: `JobSphere: You received a new applicant for ${job.title}`,
          text: `Hi ${job.recruiter_name || "Recruiter"}, you received one new applicant. Candidate ${name} (${email}) applied for ${job.title}.`
        }).catch(() => {});
      }

      return res.json({ message: "Successfully applied for this job" });
    });
  });
};

exports.getApplicationsForRecruiter = (req, res) => {
  const { recruiterId } = req.params;

  const sql = `
    SELECT
      a.id,
      a.job_id,
      j.title AS job_title,
      a.user_id,
      a.name,
      a.email,
      a.phone,
      a.location,
      a.linkedin,
      a.portfolio,
      a.experience_years,
      a.expected_salary,
      a.notice_period,
      a.work_mode,
      a.relocate,
      a.cover_letter,
      a.status,
      a.status_reason,
      a.created_at,
      a.updated_at
    FROM applications a
    INNER JOIN jobs j ON j.id = a.job_id
    WHERE j.recruiter_id = ?
    ORDER BY a.created_at DESC
  `;

  db.query(sql, [recruiterId], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows || []);
  });
};

exports.getApplicationsForUser = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      a.id,
      a.job_id,
      j.title AS job_title,
      a.status,
      a.status_reason,
      a.created_at,
      a.updated_at
    FROM applications a
    INNER JOIN jobs j ON j.id = a.job_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows || []);
  });
};

exports.updateApplicationStatus = (req, res) => {
  const { applicationId } = req.params;
  const { recruiter_id, status, status_reason } = req.body;

  const allowed = ["PENDING", "ACCEPTED", "DECLINED"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  if (status === "DECLINED" && !String(status_reason || "").trim()) {
    return res.status(400).json({ message: "Decline reason is required" });
  }

  const updateSql = `
    UPDATE applications a
    INNER JOIN jobs j ON j.id = a.job_id
    SET a.status = ?, a.status_reason = ?, a.updated_at = CURRENT_TIMESTAMP
    WHERE a.id = ? AND j.recruiter_id = ?
  `;

  db.query(
    updateSql,
    [status, status_reason ? String(status_reason).trim() : null, applicationId, recruiter_id],
    (updateErr, result) => {
      if (updateErr) return res.status(500).json(updateErr);

      if (!result.affectedRows) {
        return res.status(404).json({ message: "Application not found for this recruiter" });
      }

      const infoSql = `
        SELECT a.name, a.email, j.title AS job_title
        FROM applications a
        INNER JOIN jobs j ON j.id = a.job_id
        WHERE a.id = ?
        LIMIT 1
      `;

      db.query(infoSql, [applicationId], (infoErr, rows) => {
        if (!infoErr && rows && rows[0]?.email) {
          const info = rows[0];
          const reasonText = status === "DECLINED" && status_reason
            ? ` Reason: ${status_reason}`
            : "";

          sendEmail({
            to: info.email,
            subject: `JobSphere: Application ${status.toLowerCase()} for ${info.job_title}`,
            text: `Hi ${info.name}, your application for \"${info.job_title}\" has been ${status.toLowerCase()} on JobSphere.${reasonText}`
          }).catch(() => {});
        }

        return res.json({ message: `Application ${status.toLowerCase()} successfully` });
      });
    }
  );
};

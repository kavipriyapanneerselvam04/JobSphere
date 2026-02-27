const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }

  console.log("MySQL connected");

  const checkRecruiterColumnSql = `
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'recruiter_id'
  `;

  db.query(checkRecruiterColumnSql, (checkErr, rows) => {
    if (checkErr) {
      console.error("jobs schema check failed:", checkErr.message);
      return;
    }

    const exists = Number(rows?.[0]?.count || 0) > 0;
    if (!exists) {
      db.query("ALTER TABLE jobs ADD COLUMN recruiter_id INT NULL", (alterErr) => {
        if (alterErr) {
          console.error("jobs schema sync failed:", alterErr.message);
          return;
        }
        console.log("jobs schema sync: recruiter_id column added");
      });
    }
  });

  const createApplicationsTableSql = `
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      user_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(200) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      location VARCHAR(150) NOT NULL,
      linkedin VARCHAR(255) NULL,
      portfolio VARCHAR(255) NULL,
      experience_years INT DEFAULT 0,
      expected_salary VARCHAR(50) NULL,
      notice_period VARCHAR(50) NULL,
      work_mode VARCHAR(30) NULL,
      relocate TINYINT(1) DEFAULT 0,
      cover_letter TEXT NULL,
      status ENUM('PENDING','ACCEPTED','DECLINED') DEFAULT 'PENDING',
      status_reason VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_job_user (job_id, user_id),
      INDEX idx_job_id (job_id),
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;

  db.query(createApplicationsTableSql, (tableErr) => {
    if (tableErr) {
      console.error("applications table init failed:", tableErr.message);
    }
  });
});

module.exports = db;

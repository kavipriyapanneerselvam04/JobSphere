const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }

  console.log("MySQL connected");

  // ✅ Create users table
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(200) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('USER','RECRUITER','ADMIN') DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ✅ Create jobs table
  db.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      salary VARCHAR(100),
      recruiter_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ✅ Create applications table
  db.query(`
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
      UNIQUE KEY uniq_job_user (job_id, user_id)
    )
  `);
});

module.exports = db;

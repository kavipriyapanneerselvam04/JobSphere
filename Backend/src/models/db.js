require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }

  console.log("MySQL connected");

  const runQuery = (sql) => {
    db.query(sql, (queryErr) => {
      if (queryErr) {
        const ignorableCodes = [
          "ER_DUP_FIELDNAME",
          "ER_DUP_KEYNAME",
          "ER_TABLE_EXISTS_ERROR",
        ];

        if (!ignorableCodes.includes(queryErr.code)) {
          console.error("Schema sync failed:", queryErr.message);
        }
      }
    });
  };

  runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(200) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('USER','RECRUITER','ADMIN') DEFAULT 'USER',
      profile_photo VARCHAR(500) NULL,
      profile_photo_public_id VARCHAR(255) NULL,
      dob DATE NULL,
      father_name VARCHAR(150) NULL,
      phone VARCHAR(30) NULL,
      address TEXT NULL,
      github_url VARCHAR(255) NULL,
      linkedin_url VARCHAR(255) NULL,
      reset_password_token VARCHAR(255) NULL,
      reset_password_expires_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  runQuery(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NULL,
      location VARCHAR(255) NULL,
      skills TEXT NULL,
      description TEXT NOT NULL,
      salary VARCHAR(100) NULL,
      recruiter_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  runQuery(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      skills TEXT NOT NULL,
      experience INT DEFAULT 0,
      file_name VARCHAR(500) NULL,
      original_file_name VARCHAR(255) NULL,
      cloudinary_public_id VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  runQuery(`
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

  runQuery("ALTER TABLE users ADD COLUMN profile_photo VARCHAR(500) NULL");
  runQuery("ALTER TABLE users ADD COLUMN profile_photo_public_id VARCHAR(255) NULL");
  runQuery("ALTER TABLE users ADD COLUMN dob DATE NULL");
  runQuery("ALTER TABLE users ADD COLUMN father_name VARCHAR(150) NULL");
  runQuery("ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL");
  runQuery("ALTER TABLE users ADD COLUMN address TEXT NULL");
  runQuery("ALTER TABLE users ADD COLUMN github_url VARCHAR(255) NULL");
  runQuery("ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255) NULL");
  runQuery("ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) NULL");
  runQuery("ALTER TABLE users ADD COLUMN reset_password_expires_at DATETIME NULL");

  runQuery("ALTER TABLE jobs ADD COLUMN skills TEXT NULL");
  runQuery("ALTER TABLE jobs MODIFY COLUMN company VARCHAR(255) NULL");
  runQuery("ALTER TABLE jobs MODIFY COLUMN location VARCHAR(255) NULL");

  runQuery("ALTER TABLE resumes ADD COLUMN original_file_name VARCHAR(255) NULL");
  runQuery("ALTER TABLE resumes ADD COLUMN cloudinary_public_id VARCHAR(255) NULL");
  runQuery("ALTER TABLE resumes MODIFY COLUMN file_name VARCHAR(500) NULL");
});

module.exports = db;

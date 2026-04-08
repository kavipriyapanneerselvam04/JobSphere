// let nodemailer = null;

// try {
//   nodemailer = require("nodemailer");
// } catch (err) {
//   nodemailer = null;
// }

// let transporter = null;

// if (nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
//   transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT || 587),
//     secure: String(process.env.SMTP_SECURE || "false") === "true",
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
// }

// async function sendEmail({ to, subject, text }) {
//   if (!to || !subject || !text) return;

//   if (!transporter) {
//     console.log(`[email skipped] to=${to} subject=${subject}`);
//     return;
//   }

//   await transporter.sendMail({
//     from: process.env.SMTP_FROM || process.env.SMTP_USER,
//     to,
//     subject,
//     text,
//   });
// }

// module.exports = { sendEmail };
// let nodemailer = null;

// try {
//   nodemailer = require("nodemailer");
// } catch (err) {
//   console.error("❌ Nodemailer not installed");
//   nodemailer = null;
// }

// // 🔍 DEBUG: Check environment variables
// console.log("ENV CHECK:", {
//   SMTP_HOST: process.env.SMTP_HOST || "MISSING",
//   SMTP_PORT: process.env.SMTP_PORT || "MISSING",
//   SMTP_USER: process.env.SMTP_USER || "MISSING",
//   SMTP_PASS: process.env.SMTP_PASS ? "EXISTS" : "MISSING",
//   SMTP_SECURE: process.env.SMTP_SECURE || "MISSING",
// });

// let transporter = null;

// if (
//   nodemailer &&
//   process.env.SMTP_HOST &&
//   process.env.SMTP_USER &&
//   process.env.SMTP_PASS
// ) {
//   transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT || 587),
//     secure: String(process.env.SMTP_SECURE || "false") === "true",
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   console.log("✅ Transporter created");
// } else {
//   console.log("❌ Transporter NOT created");
// }

// async function sendEmail({ to, subject, text }) {
//   if (!to || !subject || !text) {
//     console.log("❌ Missing email fields");
//     return;
//   }

//   if (!transporter) {
//     console.log(`❌ [email skipped] to=${to} subject=${subject}`);
//     return;
//   }

//   try {
//     await transporter.sendMail({
//       from: process.env.SMTP_FROM || process.env.SMTP_USER,
//       to,
//       subject,
//       text,
//     });

//     console.log(`✅ Email sent to ${to}`);
//   } catch (err) {
//     console.error("❌ Email error:", err.message);
//   }
// }

// module.exports = { sendEmail };
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, text }) {
  try {
    await transporter.sendMail({
      from: `"JobSphere" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent:", to);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
}

module.exports = { sendEmail };
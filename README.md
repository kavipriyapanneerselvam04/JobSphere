# JobSphere – Job Portal Web Application

![Home Page]
<img width="1920" height="1200" alt="Screenshot 2026-03-24 161530" src="https://github.com/user-attachments/assets/12fb5791-8c5c-4e5f-9a7f-18e83db21f46" />

## 🔗 Live Demo

- **Frontend (Vercel):** https://job-sphere-amber-five.vercel.app

> **Note:** This project is deployed using the free tiers of Vercel and Render. Because of free-tier limitations, the backend may take 30–60 seconds to respond after a period of inactivity, and a few features may have reduced functionality.

---

## 📌 Overview

JobSphere is a full-stack job portal web application that connects job seekers and recruiters on a single platform.

- **Job Seekers** can create accounts, browse jobs, upload resumes, and apply for positions.
- **Recruiters** can post jobs, manage listings, and review applicants.
- Secure authentication and role-based access control ensure that each user has access only to relevant features.

---

## 🚀 Features

### 👤 Job Seeker Features
- User registration and login
- Secure JWT authentication
- Browse available jobs
- Search and filter job listings
- Apply for jobs
- Upload resume
- Track application status

### 🏢 Recruiter Features
- Recruiter registration and login
- Post new job openings
- Edit and delete job postings
- View applicants for each job
- Update application status

### 🔐 Security Features
- Password hashing using bcrypt
- JWT-based authentication
- Role-based authorization
- Protected API routes

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript
- Axios

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

### Database
- MySQL

### Deployment
- Vercel (Frontend)
- Render (Backend)

### Tools & Platforms
- Git
- GitHub
- Swagger UI

---

## 📸 Screenshots

### 🏠 Home Page

<img width="1920" height="1200" alt="Screenshot 2026-03-24 161530" src="https://github.com/user-attachments/assets/7c5e80be-05b0-48b9-9766-dc91567f55a2" />


### 🔐 Login Page

<img width="1920" height="1200" alt="Screenshot 2026-03-24 161511" src="https://github.com/user-attachments/assets/4846b917-bd7b-4d06-882e-5fe7b80810de" />

<img width="1920" height="1200" alt="Screenshot 2026-03-24 162244" src="https://github.com/user-attachments/assets/a3449611-572c-45b5-a112-3be85c6b374b" />


### 📝 Register Page

<img width="1920" height="1200" alt="Screenshot 2026-03-24 161519" src="https://github.com/user-attachments/assets/64c68d03-4f86-4500-9604-93b7146d00e3" />

### 👤 User Dashboard

<img width="1920" height="1200" alt="Screenshot 2026-03-24 161537" src="https://github.com/user-attachments/assets/c7fe35e7-4976-4e96-a6a4-a5a2271ad9d3" />

<img width="1920" height="1200" alt="Screenshot 2026-03-24 161626" src="https://github.com/user-attachments/assets/c1b745b9-6aee-49ec-a5fd-7028af5dda4f" />

<img width="1920" height="1200" alt="Screenshot 2026-03-24 162202" src="https://github.com/user-attachments/assets/f0704aaa-2705-46b3-9e6b-e7062f660da7" />

<img width="1920" height="1200" alt="Screenshot 2026-03-24 162221" src="https://github.com/user-attachments/assets/e03a3f94-e414-405c-bc1e-dacddfb4d14c" />


### 🏢 Recruiter Dashboard

<img width="1920" height="1200" alt="Screenshot 2026-03-24 162314" src="https://github.com/user-attachments/assets/fa42a5ae-4e7a-4680-8049-0cd85c097f01" />

<img width="1920" height="1200" alt="Screenshot 2026-03-24 162322" src="https://github.com/user-attachments/assets/88018ecd-3603-433e-8607-cda6f9f08fa6" />




### 1. Configure Environment Variables

Create a `.env` file in the `server` folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jobsphere
JWT_SECRET=your_secret_key
```

### 2. Start the Application

#### Start Backend
```bash
cd server
npm start
```

#### Start Frontend
```bash
cd client
npm start
```

## 🎯 Future Enhancements
- Saved jobs feature
- Advanced filtering and sorting
- Admin dashboard
- Company profile pages

---

## 👩‍💻 Author

**Kavi Priya**

- GitHub: https://github.com/kavipriyapanneerselvam04
- LinkedIn: https://www.linkedin.com/in/kavipriya-p-a55752299/

---

## Deployment Setup

### Recommended split
- Frontend: Vercel
- Backend API: Render or Railway
- Database: MySQL
- File storage: Cloudinary

### Frontend
- Add `REACT_APP_API_URL` in Vercel to your deployed backend URL
- Build command: `npm run build`
- Output directory: `build`

### Backend
- Use `Backend/.env.example` as the reference for Render or Railway env vars
- Start command: `npm start`
- Root directory: `Backend`
- Set `FRONTEND_URLS` to include your Vercel domain
- Set all Cloudinary variables so resume and profile uploads work in production

### Important note
- This codebase is deployment-ready for a Vercel frontend plus a Render or Railway backend.
- A full Express backend is not configured as a Vercel serverless function in this project.

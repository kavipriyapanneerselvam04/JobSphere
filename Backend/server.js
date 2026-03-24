require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

require("./src/models/db");

const userRoutes = require("./src/routes/userRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const resumeRoutes = require("./src/routes/resumeRoutes");

const swaggerDocument = YAML.load(path.join(__dirname, "src/swagger.yaml"));
const app = express();
const allowedOrigins = String(
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backward compatibility for older local uploads.
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
app.use("/profile", express.static(path.join(__dirname, "src/uploads/profile")));

app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resume", resumeRoutes);

app.get("/", (req, res) => {
  res.send("Resume Job Portal API is running");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

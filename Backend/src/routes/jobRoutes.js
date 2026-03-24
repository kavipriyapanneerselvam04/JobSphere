const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { verifyToken, allowRoles, matchParamUser, matchBodyUser } = require("../middleware/auth");

router.post("/add", verifyToken, allowRoles("RECRUITER", "ADMIN"), matchBodyUser("recruiter_id"), jobController.addJob);
router.get("/all", verifyToken, jobController.getAllJobs);
router.get("/match/:userId", verifyToken, allowRoles("USER", "ADMIN"), matchParamUser("userId"), jobController.matchJobs);

router.post("/apply", verifyToken, allowRoles("USER", "ADMIN"), matchBodyUser("user_id"), jobController.applyForJob);
router.get(
  "/applications/recruiter/:recruiterId",
  verifyToken,
  allowRoles("RECRUITER", "ADMIN"),
  matchParamUser("recruiterId"),
  jobController.getApplicationsForRecruiter
);
router.get("/applications/user/:userId", verifyToken, matchParamUser("userId"), jobController.getApplicationsForUser);
router.put(
  "/applications/:applicationId/status",
  verifyToken,
  allowRoles("RECRUITER", "ADMIN"),
  matchBodyUser("recruiter_id"),
  jobController.updateApplicationStatus
);

module.exports = router;

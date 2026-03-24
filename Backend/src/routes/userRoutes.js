const express = require("express");
const router = express.Router();
const c = require("../controllers/userController");
const { verifyToken, allowRoles, matchParamUser } = require("../middleware/auth");

// IMPORTANT: all handlers MUST exist
router.post("/register", c.register);
router.post("/login", c.login);
router.post("/google-auth", c.googleAuth);
router.post("/forgot-password", c.forgotPassword);
router.post("/reset-password", c.resetPassword);
router.get("/all", verifyToken, allowRoles("ADMIN"), c.getAllUsers);
router.delete("/delete/:id", verifyToken, matchParamUser("id"), c.deleteUser);
router.post("/profile-photo", verifyToken, c.uploadProfilePhoto);
router.delete("/profile-photo/:id", verifyToken, matchParamUser("id"), c.deleteProfilePhoto);
router.post("/profile-photo/delete", verifyToken, c.deleteProfilePhoto);
router.get("/profile/:id", verifyToken, matchParamUser("id"), c.getUserProfile);
router.put("/profile/:id", verifyToken, matchParamUser("id"), c.updateProfile);


module.exports = router;

const express = require("express");
const { login, getMe, logout, updateProfile } = require("../controllers/authController");
const requireAuth = require("../middlewares/authMiddleware");

const router = express.Router();

// Public — login endpoint.
router.post("/login", login);
// Public — clears auth cookie if present.
router.post("/logout", logout);

// Protected — get current user info.
router.get("/me", requireAuth, getMe);

// Protected — update profile (name, email, password).
router.put("/profile", requireAuth, updateProfile);

module.exports = router;

const express = require("express");
const { login, getMe, updateProfile } = require("../controllers/authController");
const requireAuth = require("../middlewares/authMiddleware");

const router = express.Router();

// Public — login endpoint.
router.post("/login", login);

// Protected — get current user info.
router.get("/me", requireAuth, getMe);

// Protected — update profile (name, email, password).
router.put("/profile", requireAuth, updateProfile);

module.exports = router;

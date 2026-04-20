const express = require("express");

const {
	createMember,
	getAllMembers,
	getMemberById,
	getMemberHistory,
	updateMember,
	deleteMember,
} = require("../controllers/memberController");

const router = express.Router();

// Member module endpoints.
router.post("/", createMember);
router.get("/", getAllMembers);
router.get("/:id/history", getMemberHistory);
router.get("/:id", getMemberById);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);

module.exports = router;

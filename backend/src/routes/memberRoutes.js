const express = require("express");

const {
	createMember,
	getAllMembers,
	getMemberById,
	getMemberHistory,
	updateMember,
	deleteMember,
} = require("../controllers/memberController");
const {
	validateMember,
	validateMemberUpdate,
	validateIdParam,
} = require("../middlewares/validateMiddleware");

const router = express.Router();

// Member module endpoints.
router.post("/", validateMember, createMember);
router.get("/", getAllMembers);
router.get("/:id/history", validateIdParam("id", "member_id"), getMemberHistory);
router.get("/:id", validateIdParam("id", "member_id"), getMemberById);
router.put("/:id", validateIdParam("id", "member_id"), validateMemberUpdate, updateMember);
router.delete("/:id", validateIdParam("id", "member_id"), deleteMember);

module.exports = router;

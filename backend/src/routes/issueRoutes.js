const express = require("express");

const {
	issueBook,
	returnBook,
	getAllIssues,
	getActiveIssues,
	getIssueById,
} = require("../controllers/issueController");
const { validateIssue, validateIdParam } = require("../middlewares/validateMiddleware");

const router = express.Router();

// Issue module endpoints.
router.post("/", validateIssue, issueBook);
router.put("/:id/return", validateIdParam("id", "issue_id"), returnBook);
router.get("/", getAllIssues);
router.get("/active", getActiveIssues);
router.get("/:id", validateIdParam("id", "issue_id"), getIssueById);

module.exports = router;

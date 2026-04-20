const express = require("express");

const {
	issueBook,
	returnBook,
	getAllIssues,
	getActiveIssues,
	getIssueById,
} = require("../controllers/issueController");

const router = express.Router();

// Issue module endpoints.
router.post("/", issueBook);
router.put("/:id/return", returnBook);
router.get("/", getAllIssues);
router.get("/active", getActiveIssues);
router.get("/:id", getIssueById);

module.exports = router;

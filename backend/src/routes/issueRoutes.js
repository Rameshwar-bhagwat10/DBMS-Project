const express = require("express");

const {
	issueBook,
	returnBook,
	getAllIssues,
	getActiveIssues,
	getMostIssuedBooksReport,
	getTopBorrowingMembersReport,
	getTotalFinesCollectedReport,
	getIssueById,
} = require("../controllers/issueController");
const { validateIssue, validateIdParam } = require("../middlewares/validateMiddleware");

const router = express.Router();

// Issue module endpoints.
router.post("/", validateIssue, issueBook);
router.put("/:id/return", validateIdParam("id", "issue_id"), returnBook);
router.get("/", getAllIssues);
router.get("/active", getActiveIssues);
router.get("/reports/most-issued-books", getMostIssuedBooksReport);
router.get("/reports/top-borrowing-members", getTopBorrowingMembersReport);
router.get("/reports/total-fines-collected", getTotalFinesCollectedReport);
router.get("/:id", validateIdParam("id", "issue_id"), getIssueById);

module.exports = router;

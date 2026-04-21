const { sendSuccess } = require("../utils/responseHandler");
const issueService = require("../services/issueService");

// Issue a new book to a member.
async function issueBook(req, res, next) {
	try {
		const issue = await issueService.issueBook(req.body);
		return sendSuccess(res, "Book issued successfully", issue);
	} catch (error) {
		return next(error);
	}
}

// Mark an issue as returned.
async function returnBook(req, res, next) {
	try {
		const issue = await issueService.returnBook(req.params.id);
		return sendSuccess(res, "Book returned successfully", issue);
	} catch (error) {
		return next(error);
	}
}

// Fetch all issues with joined book/member details.
async function getAllIssues(req, res, next) {
	try {
		const issues = await issueService.getAllIssues(req.query);
		return sendSuccess(res, "Issues fetched successfully", issues);
	} catch (error) {
		return next(error);
	}
}

// Fetch only active issues (return_date is null).
async function getActiveIssues(req, res, next) {
	try {
		const issues = await issueService.getActiveIssues();
		return sendSuccess(res, "Active issues fetched successfully", issues);
	} catch (error) {
		return next(error);
	}
}

// Fetch issue details by id.
async function getIssueById(req, res, next) {
	try {
		const issue = await issueService.getIssueById(req.params.id);
		return sendSuccess(res, "Issue fetched successfully", issue);
	} catch (error) {
		return next(error);
	}
}

// Fetch report of most issued books.
async function getMostIssuedBooksReport(req, res, next) {
	try {
		const report = await issueService.getMostIssuedBooksReport(req.query);
		return sendSuccess(res, "Most issued books report fetched successfully", report);
	} catch (error) {
		return next(error);
	}
}

// Fetch report of members with most borrowings.
async function getTopBorrowingMembersReport(req, res, next) {
	try {
		const report = await issueService.getTopBorrowingMembersReport(req.query);
		return sendSuccess(res, "Top borrowing members report fetched successfully", report);
	} catch (error) {
		return next(error);
	}
}

// Fetch report of total paid fines collected.
async function getTotalFinesCollectedReport(req, res, next) {
	try {
		const report = await issueService.getTotalFinesCollectedReport();
		return sendSuccess(res, "Total fines collected report fetched successfully", report);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	issueBook,
	returnBook,
	getAllIssues,
	getActiveIssues,
	getMostIssuedBooksReport,
	getTopBorrowingMembersReport,
	getTotalFinesCollectedReport,
	getIssueById,
};

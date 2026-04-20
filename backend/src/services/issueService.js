const issueModel = require("../models/issueModel");

// Builds consistent operational errors for middleware formatting.
function createError(message, statusCode = 400) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

// Validates and parses numeric ids.
function parsePositiveInt(value, fieldName) {
	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw createError(`${fieldName} must be a positive integer`, 400);
	}

	return parsed;
}

// Validates issue payload.
function validateIssuePayload(payload) {
	const bookId = parsePositiveInt(payload.book_id, "book_id");
	const memberId = parsePositiveInt(payload.member_id, "member_id");
	const days = parsePositiveInt(payload.days, "days");

	return {
		bookId,
		memberId,
		days,
	};
}

// Creates issue record. Stock checks and decrement are trigger-driven.
async function issueBook(payload) {
	const data = validateIssuePayload(payload);

	const book = await issueModel.findBookById(data.bookId);
	if (!book) {
		throw createError("Book not found", 404);
	}

	const member = await issueModel.findMemberById(data.memberId);
	if (!member) {
		throw createError("Member not found", 404);
	}

	try {
		const issueId = await issueModel.createIssue(data.bookId, data.memberId, data.days);
		const issue = await issueModel.getIssueById(issueId);
		return issue;
	} catch (error) {
		if (error.sqlState === "45000") {
			throw createError(error.sqlMessage || "Issue operation failed", 409);
		}

		throw error;
	}
}

// Marks issue as returned. Stock increment and fine generation are trigger-driven.
async function returnBook(issueIdParam) {
	const issueId = parsePositiveInt(issueIdParam, "issue_id");
	const issueRow = await issueModel.getIssueRowById(issueId);

	if (!issueRow) {
		throw createError("Issue not found", 404);
	}

	if (issueRow.return_date !== null) {
		throw createError("Book already returned", 409);
	}

	await issueModel.markIssueAsReturned(issueId);
	const issue = await issueModel.getIssueById(issueId);
	return issue;
}

// Returns joined list of all issues.
async function getAllIssues() {
	return issueModel.getAllIssues();
}

// Returns joined list of active issues.
async function getActiveIssues() {
	return issueModel.getActiveIssues();
}

// Returns one issue by id.
async function getIssueById(issueIdParam) {
	const issueId = parsePositiveInt(issueIdParam, "issue_id");
	const issue = await issueModel.getIssueById(issueId);

	if (!issue) {
		throw createError("Issue not found", 404);
	}

	return issue;
}

module.exports = {
	issueBook,
	returnBook,
	getAllIssues,
	getActiveIssues,
	getIssueById,
};

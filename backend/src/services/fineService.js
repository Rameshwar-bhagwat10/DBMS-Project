const fineModel = require("../models/fineModel");

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

// Returns all fines with related issue, book, and member details.
async function getAllFines() {
	return fineModel.getAllFines();
}

// Returns only unpaid fines.
async function getUnpaidFines() {
	return fineModel.getUnpaidFines();
}

// Returns fine details by issue id.
async function getFineByIssueId(issueIdParam) {
	const issueId = parsePositiveInt(issueIdParam, "issue_id");
	const fine = await fineModel.getFineByIssueId(issueId);

	if (!fine) {
		throw createError("Fine not found for this issue", 404);
	}

	return fine;
}

// Marks a fine as paid and blocks duplicate payment.
async function payFine(fineIdParam) {
	const fineId = parsePositiveInt(fineIdParam, "fine_id");
	const fine = await fineModel.getFineById(fineId);

	if (!fine) {
		throw createError("Fine not found", 404);
	}

	if (Boolean(fine.paid)) {
		throw createError("Fine already paid", 409);
	}

	await fineModel.markFineAsPaid(fineId);
	const paidFine = await fineModel.getFineById(fineId);
	return paidFine;
}

// Returns all fines for one member.
async function getMemberFines(memberIdParam) {
	const memberId = parsePositiveInt(memberIdParam, "member_id");
	const member = await fineModel.findMemberById(memberId);

	if (!member) {
		throw createError("Member not found", 404);
	}

	return fineModel.getFinesByMemberId(memberId);
}

module.exports = {
	getAllFines,
	getUnpaidFines,
	getFineByIssueId,
	payFine,
	getMemberFines,
};

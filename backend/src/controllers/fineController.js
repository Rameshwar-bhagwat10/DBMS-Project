const { sendSuccess } = require("../utils/responseHandler");
const fineService = require("../services/fineService");

// Fetch all fines with issue, book, and member details.
async function getAllFines(req, res, next) {
	try {
		const fines = await fineService.getAllFines();
		return sendSuccess(res, "Fines fetched successfully", fines);
	} catch (error) {
		return next(error);
	}
}

// Fetch only unpaid fines.
async function getUnpaidFines(req, res, next) {
	try {
		const fines = await fineService.getUnpaidFines();
		return sendSuccess(res, "Unpaid fines fetched successfully", fines);
	} catch (error) {
		return next(error);
	}
}

// Fetch fine details by issue id.
async function getFineByIssueId(req, res, next) {
	try {
		const fine = await fineService.getFineByIssueId(req.params.id);
		return sendSuccess(res, "Fine fetched successfully", fine);
	} catch (error) {
		return next(error);
	}
}

// Mark one fine as paid.
async function payFine(req, res, next) {
	try {
		const fine = await fineService.payFine(req.params.id);
		return sendSuccess(res, "Fine paid successfully", fine);
	} catch (error) {
		return next(error);
	}
}

// Fetch all fines for one member.
async function getMemberFines(req, res, next) {
	try {
		const fines = await fineService.getMemberFines(req.params.id);
		return sendSuccess(res, "Member fines fetched successfully", fines);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	getAllFines,
	getUnpaidFines,
	getFineByIssueId,
	payFine,
	getMemberFines,
};

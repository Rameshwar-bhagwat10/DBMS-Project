const { sendError } = require("../utils/responseHandler");

function getDatabaseErrorResponse(error) {
	if (!error || !error.code) {
		return null;
	}

	if (!String(error.code).startsWith("ER_")) {
		return null;
	}

	if (error.code === "ER_DUP_ENTRY") {
		return {
			statusCode: 409,
			message: "Duplicate entry",
		};
	}

	if (error.code === "ER_NO_REFERENCED_ROW_2" || error.code === "ER_ROW_IS_REFERENCED_2") {
		return {
			statusCode: 409,
			message: "Operation violates data integrity constraints",
		};
	}

	return {
		statusCode: 500,
		message: "Database operation failed",
	};
}

function errorMiddleware(err, req, res, next) {
	const dbError = getDatabaseErrorResponse(err);
	if (dbError) {
		return sendError(res, dbError.message, dbError.statusCode);
	}

	const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
	const message = statusCode >= 500 ? "Internal server error" : err.message || "Request failed";

	return sendError(res, message, statusCode);
}

module.exports = errorMiddleware;

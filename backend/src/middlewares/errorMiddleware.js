const { sendError } = require("../utils/responseHandler");

function errorMiddleware(err, req, res, next) {
	// Centralized error shape for all APIs.
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal server error";

	// Expose stack trace only in development mode.
	const errorData = process.env.NODE_ENV === "development" ? { stack: err.stack } : {};

	return sendError(res, message, statusCode, errorData);
}

module.exports = errorMiddleware;

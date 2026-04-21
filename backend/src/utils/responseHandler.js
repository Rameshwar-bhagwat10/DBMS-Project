// Standard success response wrapper.
function sendSuccess(res, message, data = {}) {
	return res.status(200).json({
		success: true,
		message,
		data,
	});
}

// Standard error response wrapper.
function sendError(res, message = "Internal server error", statusCode = 500) {
	return res.status(statusCode).json({
		success: false,
		message,
	});
}

module.exports = {
	sendSuccess,
	sendError,
};

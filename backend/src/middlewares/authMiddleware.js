const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/responseHandler");

const JWT_SECRET = process.env.JWT_SECRET || "library_secret_key_2026";

/**
 * Express middleware that verifies the JWT from the Authorization header.
 * Attaches decoded user to req.user on success.
 */
function requireAuth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return sendError(res, "Authentication required", 401);
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		return next();
	} catch (error) {
		return sendError(res, "Invalid or expired token", 401);
	}
}

module.exports = requireAuth;

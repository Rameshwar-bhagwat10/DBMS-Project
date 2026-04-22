const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/responseHandler");

const JWT_SECRET = process.env.JWT_SECRET || "library_secret_key_2026";
const AUTH_COOKIE_NAME = "auth_token";

function getTokenFromCookieHeader(cookieHeader) {
	if (!cookieHeader) {
		return null;
	}

	const cookieParts = cookieHeader.split(";");

	for (const part of cookieParts) {
		const trimmedPart = part.trim();

		if (trimmedPart.startsWith(`${AUTH_COOKIE_NAME}=`)) {
			const cookieValue = trimmedPart.slice(AUTH_COOKIE_NAME.length + 1);

			try {
				return decodeURIComponent(cookieValue);
			} catch {
				return cookieValue;
			}
		}
	}

	return null;
}

function getTokenFromRequest(req) {
	const authHeader = req.headers.authorization;

	if (authHeader && authHeader.startsWith("Bearer ")) {
		return authHeader.split(" ")[1];
	}

	return getTokenFromCookieHeader(req.headers.cookie);
}

/**
 * Express middleware that verifies the JWT from Authorization header or auth cookie.
 * Attaches decoded user to req.user on success.
 */
function requireAuth(req, res, next) {
	const token = getTokenFromRequest(req);

	if (!token) {
		return sendError(res, "Authentication required", 401);
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		req.authToken = token;
		return next();
	} catch (error) {
		return sendError(res, "Invalid or expired token", 401);
	}
}

module.exports = requireAuth;

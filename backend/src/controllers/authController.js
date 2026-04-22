const { sendSuccess } = require("../utils/responseHandler");
const authService = require("../services/authService");

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getAuthCookieOptions() {
	const isProduction = process.env.NODE_ENV === "production";

	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		maxAge: AUTH_COOKIE_MAX_AGE_MS,
		path: "/",
	};
}

function setAuthCookie(res, token) {
	res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

function clearAuthCookie(res) {
	const cookieOptions = getAuthCookieOptions();
	delete cookieOptions.maxAge;

	res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
}

function hasAuthCookie(req) {
	const cookieHeader = req.headers.cookie;

	if (!cookieHeader) {
		return false;
	}

	return cookieHeader
		.split(";")
		.some((cookiePart) => cookiePart.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
}

/**
 * POST /api/auth/login
 * Authenticates a librarian by email and password, returns a JWT token.
 */
async function login(req, res, next) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			const error = new Error("Email and password are required");
			error.statusCode = 400;
			throw error;
		}

		const result = await authService.authenticateUser(email, password);
		setAuthCookie(res, result.token);

		return sendSuccess(res, "Login successful", result);
	} catch (error) {
		return next(error);
	}
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user's info.
 */
async function getMe(req, res, next) {
	try {
		const user = await authService.getUserById(req.user.id);

		if (req.authToken && !hasAuthCookie(req)) {
			setAuthCookie(res, req.authToken);
		}

		return sendSuccess(res, "User fetched successfully", user);
	} catch (error) {
		return next(error);
	}
}

/**
 * POST /api/auth/logout
 * Clears auth cookie so browser session is fully logged out.
 */
async function logout(req, res, next) {
	try {
		clearAuthCookie(res);
		return sendSuccess(res, "Logout successful");
	} catch (error) {
		return next(error);
	}
}

/**
 * PUT /api/auth/profile
 * Updates the current user's name, email, or password.
 */
async function updateProfile(req, res, next) {
	try {
		const { name, email, currentPassword, newPassword } = req.body;

		if (!name && !email && !newPassword) {
			const error = new Error("At least one field (name, email, or newPassword) is required");
			error.statusCode = 400;
			throw error;
		}

		const updatedUser = await authService.updateProfile(req.user.id, {
			name,
			email,
			currentPassword,
			newPassword,
		});

		return sendSuccess(res, "Profile updated successfully", updatedUser);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	login,
	getMe,
	logout,
	updateProfile,
};

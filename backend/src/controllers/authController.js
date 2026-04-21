const { sendSuccess } = require("../utils/responseHandler");
const authService = require("../services/authService");

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

		return sendSuccess(res, "User fetched successfully", user);
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
	updateProfile,
};

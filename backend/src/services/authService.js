const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "library_secret_key_2026";
const TOKEN_EXPIRY = "24h";
const SALT_ROUNDS = 10;

/**
 * Authenticate a librarian by email and password.
 * Returns { token, user } on success, throws on failure.
 */
async function authenticateUser(email, password) {
	const [rows] = await pool.query(
		"SELECT librarian_id, username, email, password_hash, name FROM librarians WHERE email = ?",
		[email]
	);

	if (rows.length === 0) {
		const error = new Error("Invalid email or password");
		error.statusCode = 401;
		throw error;
	}

	const librarian = rows[0];
	const isMatch = await bcrypt.compare(password, librarian.password_hash);

	if (!isMatch) {
		const error = new Error("Invalid email or password");
		error.statusCode = 401;
		throw error;
	}

	const token = jwt.sign(
		{ id: librarian.librarian_id, username: librarian.username },
		JWT_SECRET,
		{ expiresIn: TOKEN_EXPIRY }
	);

	return {
		token,
		user: {
			id: librarian.librarian_id,
			username: librarian.username,
			email: librarian.email,
			name: librarian.name,
		},
	};
}

/**
 * Fetch a librarian by ID (used by the /me endpoint).
 */
async function getUserById(id) {
	const [rows] = await pool.query(
		"SELECT librarian_id, username, email, name FROM librarians WHERE librarian_id = ?",
		[id]
	);

	if (rows.length === 0) {
		const error = new Error("User not found");
		error.statusCode = 404;
		throw error;
	}

	const librarian = rows[0];

	return {
		id: librarian.librarian_id,
		username: librarian.username,
		email: librarian.email,
		name: librarian.name,
	};
}

/**
 * Update librarian profile (name, email, password).
 */
async function updateProfile(id, { name, email, currentPassword, newPassword }) {
	const [rows] = await pool.query(
		"SELECT librarian_id, password_hash FROM librarians WHERE librarian_id = ?",
		[id]
	);

	if (rows.length === 0) {
		const error = new Error("User not found");
		error.statusCode = 404;
		throw error;
	}

	const librarian = rows[0];

	// If changing password, verify current password first.
	if (newPassword) {
		if (!currentPassword) {
			const error = new Error("Current password is required to set a new password");
			error.statusCode = 400;
			throw error;
		}

		const isMatch = await bcrypt.compare(currentPassword, librarian.password_hash);

		if (!isMatch) {
			const error = new Error("Current password is incorrect");
			error.statusCode = 401;
			throw error;
		}

		const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
		await pool.query(
			"UPDATE librarians SET password_hash = ? WHERE librarian_id = ?",
			[newHash, id]
		);
	}

	// Update name and email if provided.
	const updates = [];
	const values = [];

	if (name) {
		updates.push("name = ?");
		values.push(name);
	}

	if (email) {
		updates.push("email = ?");
		values.push(email);
	}

	if (updates.length > 0) {
		values.push(id);
		await pool.query(
			`UPDATE librarians SET ${updates.join(", ")} WHERE librarian_id = ?`,
			values
		);
	}

	return getUserById(id);
}

module.exports = {
	authenticateUser,
	getUserById,
	updateProfile,
};

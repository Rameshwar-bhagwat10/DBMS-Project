/**
 * Creates the librarians table and seeds a default admin user.
 *
 * Usage: node scripts/createLibrarianTable.js
 */
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SALT_ROUNDS = 10;

const DEFAULT_LIBRARIAN = {
	username: "admin",
	password: "admin123",
	name: "Admin Librarian",
};

async function run() {
	const pool = mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		waitForConnections: true,
		connectionLimit: 5,
	});

	const connection = await pool.getConnection();

	try {
		// Create the librarians table if it doesn't exist.
		await connection.query(`
			CREATE TABLE IF NOT EXISTS librarians (
				librarian_id INT AUTO_INCREMENT PRIMARY KEY,
				username VARCHAR(50) NOT NULL UNIQUE,
				password_hash VARCHAR(255) NOT NULL,
				name VARCHAR(100) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
		`);

		console.log("librarians table created (or already exists).");

		// Check if the default admin already exists.
		const [existing] = await connection.query(
			"SELECT librarian_id FROM librarians WHERE username = ?",
			[DEFAULT_LIBRARIAN.username]
		);

		if (existing.length > 0) {
			console.log(`Default librarian '${DEFAULT_LIBRARIAN.username}' already exists. Skipping seed.`);
		} else {
			const hash = await bcrypt.hash(DEFAULT_LIBRARIAN.password, SALT_ROUNDS);

			await connection.query(
				"INSERT INTO librarians (username, password_hash, name) VALUES (?, ?, ?)",
				[DEFAULT_LIBRARIAN.username, hash, DEFAULT_LIBRARIAN.name]
			);

			console.log(`Default librarian created — username: ${DEFAULT_LIBRARIAN.username}, password: ${DEFAULT_LIBRARIAN.password}`);
		}
	} catch (error) {
		console.error("Error:", error.message);
		process.exitCode = 1;
	} finally {
		connection.release();
		await pool.end();
	}
}

run();

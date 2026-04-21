/**
 * Migrates the librarians table to add an email column and updates the default admin.
 *
 * Usage: node scripts/addEmailToLibrarians.js
 */
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
		// Check if email column already exists.
		const [columns] = await connection.query(
			"SHOW COLUMNS FROM librarians LIKE 'email'"
		);

		if (columns.length === 0) {
			await connection.query(
				"ALTER TABLE librarians ADD COLUMN email VARCHAR(100) NOT NULL DEFAULT '' AFTER username"
			);
			console.log("Added 'email' column to librarians table.");

			// Add unique index on email.
			await connection.query(
				"ALTER TABLE librarians ADD UNIQUE INDEX idx_librarian_email (email)"
			).catch(() => {
				console.log("Unique index on email may already exist, skipping.");
			});
		} else {
			console.log("'email' column already exists. Skipping.");
		}

		// Update default admin with an email if it has none.
		await connection.query(
			"UPDATE librarians SET email = 'admin@library.com' WHERE username = 'admin' AND (email = '' OR email IS NULL)"
		);

		console.log("Default admin email set to: admin@library.com");
		console.log("Done.");
	} catch (error) {
		console.error("Error:", error.message);
		process.exitCode = 1;
	} finally {
		connection.release();
		await pool.end();
	}
}

run();

const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// Shared MySQL pool for the entire application.
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

async function initializeDatabaseConnection() {
	try {
		// Quick connection check on startup to fail fast if DB is unreachable.
		const connection = await pool.getConnection();
		console.log("Database connected successfully");
		connection.release();
	} catch (error) {
		console.error("Database connection error:", error.message);
	}
}

initializeDatabaseConnection();

module.exports = pool;

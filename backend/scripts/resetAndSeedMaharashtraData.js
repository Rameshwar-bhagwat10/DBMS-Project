const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const authors = [
	"R. K. Narayan",
	"Munshi Premchand",
	"Ruskin Bond",
	"Amish Tripathi",
	"Chetan Bhagat",
	"Sudha Murty",
	"Shivaji Sawant",
	"Khushwant Singh",
	"Kalki Krishnamurthy",
	"S. L. Bhyrappa",
];

const books = [
	["Malgudi Days", "9788185986024", "Indian Thought Publications", 12, 12],
	["Godaan", "9788126713641", "Rajpal and Sons", 10, 10],
	["The Blue Umbrella", "9788129145043", "Rupa Publications", 9, 9],
	["The Immortals of Meluha", "9789382618348", "Westland", 14, 14],
	["Five Point Someone", "9788129135723", "Rupa Publications", 11, 11],
	["Wise and Otherwise", "9780143417231", "Penguin India", 13, 13],
	["Mrityunjaya", "9788177666514", "Continental Prakashan", 8, 8],
	["Train to Pakistan", "9780143065883", "Penguin India", 7, 7],
	["Ponniyin Selvan Part 1", "9789350293379", "Vanathi Pathippagam", 10, 10],
	["Parva", "9780198066231", "Oxford University Press", 6, 6],
];

const members = [
	["Aarav Patil", "aarav.patil@maharashtrarun.edu.in", "9876500001", "2026-04-01"],
	["Sanika Deshmukh", "sanika.deshmukh@maharashtrarun.edu.in", "9876500002", "2026-04-02"],
	["Omkar Jadhav", "omkar.jadhav@maharashtrarun.edu.in", "9876500003", "2026-04-03"],
	["Isha Kulkarni", "isha.kulkarni@maharashtrarun.edu.in", "9876500004", "2026-04-04"],
	["Pranav Shinde", "pranav.shinde@maharashtrarun.edu.in", "9876500005", "2026-04-05"],
	["Rutuja Pawar", "rutuja.pawar@maharashtrarun.edu.in", "9876500006", "2026-04-06"],
	["Vedant Joshi", "vedant.joshi@maharashtrarun.edu.in", "9876500007", "2026-04-07"],
	["Sneha More", "sneha.more@maharashtrarun.edu.in", "9876500008", "2026-04-08"],
	["Atharva Bhosale", "atharva.bhosale@maharashtrarun.edu.in", "9876500009", "2026-04-09"],
	["Gauri Chavan", "gauri.chavan@maharashtrarun.edu.in", "9876500010", "2026-04-10"],
];

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
		await connection.beginTransaction();

		await connection.query("DELETE FROM fines");
		await connection.query("DELETE FROM issues");
		await connection.query("DELETE FROM book_authors");
		await connection.query("DELETE FROM members");
		await connection.query("DELETE FROM authors");
		await connection.query("DELETE FROM books");

		await connection.query("ALTER TABLE fines AUTO_INCREMENT = 1");
		await connection.query("ALTER TABLE issues AUTO_INCREMENT = 1");
		await connection.query("ALTER TABLE book_authors AUTO_INCREMENT = 1").catch(() => {});
		await connection.query("ALTER TABLE members AUTO_INCREMENT = 1");
		await connection.query("ALTER TABLE authors AUTO_INCREMENT = 1");
		await connection.query("ALTER TABLE books AUTO_INCREMENT = 1");

		await connection.query("INSERT INTO authors (name) VALUES ?", [authors.map((name) => [name])]);
		await connection.query(
			"INSERT INTO books (title, isbn, publisher, total_copies, available_copies) VALUES ?",
			[books]
		);

		const bookAuthorLinks = books.map((_, index) => [index + 1, index + 1]);
		await connection.query("INSERT INTO book_authors (book_id, author_id) VALUES ?", [bookAuthorLinks]);

		await connection.query(
			"INSERT INTO members (name, email, phone, membership_date) VALUES ?",
			[members]
		);

		await connection.commit();

		const [counts] = await connection.query(
			"SELECT 'books' AS table_name, COUNT(*) AS row_count FROM books " +
			"UNION ALL SELECT 'authors', COUNT(*) FROM authors " +
			"UNION ALL SELECT 'book_authors', COUNT(*) FROM book_authors " +
			"UNION ALL SELECT 'members', COUNT(*) FROM members " +
			"UNION ALL SELECT 'issues', COUNT(*) FROM issues " +
			"UNION ALL SELECT 'fines', COUNT(*) FROM fines"
		);

		console.log("Database reset and reseed completed successfully.");
		console.table(counts);
	} catch (error) {
		await connection.rollback();
		console.error("Reset/reseed failed:", error.message);
		process.exitCode = 1;
	} finally {
		connection.release();
		await pool.end();
	}
}

run();

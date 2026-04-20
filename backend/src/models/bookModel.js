const pool = require("../config/db");

// Provides dedicated connection for transaction workflows in service layer.
async function getConnection() {
	return pool.getConnection();
}

// Finds book by ISBN; optional exclusion used by update flow.
async function findBookByIsbn(isbn, excludeBookId = null, executor = pool) {
	let query = "SELECT book_id FROM books WHERE isbn = ?";
	const params = [isbn];

	if (excludeBookId !== null) {
		query += " AND book_id <> ?";
		params.push(excludeBookId);
	}

	const [rows] = await executor.query(query, params);
	return rows[0] || null;
}

// Inserts core book data.
async function insertBook(executor, bookData) {
	const [result] = await executor.query(
		`INSERT INTO books (title, isbn, publisher, total_copies, available_copies)
		 VALUES (?, ?, ?, ?, ?)`,
		[
			bookData.title,
			bookData.isbn,
			bookData.publisher,
			bookData.total_copies,
			bookData.available_copies,
		]
	);

	return result.insertId;
}

// Resolves author by name (case-insensitive).
async function findAuthorByName(executor, authorName) {
	const [rows] = await executor.query(
		"SELECT author_id FROM authors WHERE LOWER(name) = LOWER(?) LIMIT 1",
		[authorName]
	);

	return rows[0] || null;
}

// Creates a new author record.
async function insertAuthor(executor, authorName) {
	const [result] = await executor.query("INSERT INTO authors (name) VALUES (?)", [authorName]);
	return result.insertId;
}

// Inserts many-to-many mapping row.
async function insertBookAuthor(executor, bookId, authorId) {
	await executor.query("INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)", [bookId, authorId]);
}

// Removes all author mappings for a book.
async function deleteBookAuthors(executor, bookId) {
	await executor.query("DELETE FROM book_authors WHERE book_id = ?", [bookId]);
}

// Fetches and locks a book row for safe updates inside transaction.
async function getBookForUpdate(executor, bookId) {
	const [rows] = await executor.query(
		`SELECT book_id, title, isbn, publisher, total_copies, available_copies
		 FROM books
		 WHERE book_id = ?
		 FOR UPDATE`,
		[bookId]
	);

	return rows[0] || null;
}

// Updates editable book fields.
async function updateBook(executor, bookId, bookData) {
	const [result] = await executor.query(
		`UPDATE books
		 SET title = ?, isbn = ?, publisher = ?, total_copies = ?, available_copies = ?
		 WHERE book_id = ?`,
		[
			bookData.title,
			bookData.isbn,
			bookData.publisher,
			bookData.total_copies,
			bookData.available_copies,
			bookId,
		]
	);

	return result.affectedRows;
}

// Deletes book by id.
async function deleteBook(bookId) {
	const [result] = await pool.query("DELETE FROM books WHERE book_id = ?", [bookId]);
	return result.affectedRows;
}

// Returns all books with comma-separated authors for service transformation.
async function getAllBooks() {
	const [rows] = await pool.query(
		`SELECT
			 b.book_id,
			 b.title,
			 b.isbn,
			 b.publisher,
			 b.total_copies,
			 b.available_copies,
			 GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ',') AS authors
		 FROM books b
		 LEFT JOIN book_authors ba ON b.book_id = ba.book_id
		 LEFT JOIN authors a ON ba.author_id = a.author_id
		 GROUP BY b.book_id
		 ORDER BY b.book_id`
	);

	return rows;
}

// Returns single book with comma-separated authors.
async function getBookById(bookId) {
	const [rows] = await pool.query(
		`SELECT
			 b.book_id,
			 b.title,
			 b.isbn,
			 b.publisher,
			 b.total_copies,
			 b.available_copies,
			 GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ',') AS authors
		 FROM books b
		 LEFT JOIN book_authors ba ON b.book_id = ba.book_id
		 LEFT JOIN authors a ON ba.author_id = a.author_id
		 WHERE b.book_id = ?
		 GROUP BY b.book_id`,
		[bookId]
	);

	return rows[0] || null;
}

module.exports = {
	getConnection,
	findBookByIsbn,
	insertBook,
	findAuthorByName,
	insertAuthor,
	insertBookAuthor,
	deleteBookAuthors,
	getBookForUpdate,
	updateBook,
	deleteBook,
	getAllBooks,
	getBookById,
};

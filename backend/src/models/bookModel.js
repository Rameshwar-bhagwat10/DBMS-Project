const pool = require("../config/db");

// Provides dedicated connection for transaction workflows in service layer.
async function getConnection() {
	return pool.getConnection();
}

function buildBookFilterSql(options = {}) {
	const conditions = [];
	const params = [];

	if (options.available === true) {
		conditions.push("b.available_copies > 0");
	}

	if (options.available === false) {
		conditions.push("b.available_copies = 0");
	}

	if (options.authorFilter) {
		conditions.push(
			`EXISTS (
				SELECT 1
				FROM book_authors fba
				JOIN authors fa ON fba.author_id = fa.author_id
				WHERE fba.book_id = b.book_id
				AND LOWER(fa.name) LIKE LOWER(?)
			)`
		);
		params.push(`%${options.authorFilter}%`);
	}

	if (options.searchTerm) {
		conditions.push(
			`(
				LOWER(b.title) LIKE LOWER(?)
				OR EXISTS (
					SELECT 1
					FROM book_authors sba
					JOIN authors sa ON sba.author_id = sa.author_id
					WHERE sba.book_id = b.book_id
					AND LOWER(sa.name) LIKE LOWER(?)
				)
			)`
		);
		params.push(`%${options.searchTerm}%`, `%${options.searchTerm}%`);
	}

	const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	return {
		whereSql,
		params,
	};
}

function resolveBookSortColumn(sortBy) {
	const sortMap = {
		book_id: "b.book_id",
		title: "b.title",
		publisher: "b.publisher",
		total_copies: "b.total_copies",
		available_copies: "b.available_copies",
	};

	return sortMap[sortBy] || sortMap.book_id;
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

// Counts active issue rows (not returned) for one book.
async function countActiveIssuesForBook(bookId, executor = pool) {
	const [rows] = await executor.query(
		`SELECT COUNT(*) AS total
		 FROM issues
		 WHERE book_id = ? AND return_date IS NULL`,
		[bookId]
	);

	return rows[0].total;
}

// Deletes returned issue history rows for one book.
async function deleteReturnedIssuesByBook(bookId, executor = pool) {
	const [result] = await executor.query(
		"DELETE FROM issues WHERE book_id = ? AND return_date IS NOT NULL",
		[bookId]
	);

	return result.affectedRows;
}

// Deletes book by id.
async function deleteBook(bookId, executor = pool) {
	const [result] = await executor.query("DELETE FROM books WHERE book_id = ?", [bookId]);
	return result.affectedRows;
}

// Returns books with optional search/filter/sort/pagination.
async function getBooksForListing(options = {}) {
	const { whereSql, params } = buildBookFilterSql(options);
	const sortColumn = resolveBookSortColumn(options.sortBy);
	const sortDirection = options.sortOrder === "DESC" ? "DESC" : "ASC";

	let limitSql = "";
	if (Number.isInteger(options.limit) && options.limit > 0) {
		limitSql = " LIMIT ? OFFSET ?";
		params.push(options.limit, options.offset || 0);
	}

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
		 ${whereSql}
		 GROUP BY b.book_id
		 ORDER BY ${sortColumn} ${sortDirection}${limitSql}`,
		params
	);

	return rows;
}

// Returns total row count for the same filters used in book listing.
async function countBooksForListing(options = {}) {
	const { whereSql, params } = buildBookFilterSql(options);

	const [rows] = await pool.query(
		`SELECT COUNT(*) AS total
		 FROM books b
		 ${whereSql}`,
		params
	);

	return rows[0].total;
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
	countActiveIssuesForBook,
	deleteReturnedIssuesByBook,
	deleteBook,
	getBooksForListing,
	countBooksForListing,
	getAllBooks,
	getBookById,
};

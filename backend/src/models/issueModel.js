const pool = require("../config/db");

// Provides dedicated connection for transaction workflows in service layer.
async function getConnection() {
	return pool.getConnection();
}

function resolveIssueSortColumn(sortBy) {
	const sortMap = {
		issue_id: "i.issue_id",
		issue_date: "i.issue_date",
		due_date: "i.due_date",
		return_date: "i.return_date",
		title: "b.title",
		member_name: "m.name",
	};

	return sortMap[sortBy] || sortMap.issue_id;
}

// Checks if a book exists.
async function findBookById(bookId, executor = pool) {
	const [rows] = await executor.query("SELECT book_id FROM books WHERE book_id = ?", [bookId]);
	return rows[0] || null;
}

// Checks if a member exists.
async function findMemberById(memberId, executor = pool) {
	const [rows] = await executor.query("SELECT member_id FROM members WHERE member_id = ?", [memberId]);
	return rows[0] || null;
}

// Creates a new issue row. Stock handling is delegated to triggers.
async function createIssue(bookId, memberId, days, executor = pool) {
	const [result] = await executor.query(
		`INSERT INTO issues (book_id, member_id, issue_date, due_date)
		 VALUES (?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL ? DAY))`,
		[bookId, memberId, days]
	);

	return result.insertId;
}

// Raw issue row by id.
async function getIssueRowById(issueId, executor = pool) {
	const [rows] = await executor.query(
		`SELECT issue_id, book_id, member_id, issue_date, due_date, return_date
		 FROM issues
		 WHERE issue_id = ?`,
		[issueId]
	);

	return rows[0] || null;
}

// Marks issue as returned. Stock/fine changes are delegated to triggers.
async function markIssueAsReturned(issueId, executor = pool) {
	const [result] = await executor.query(
		"UPDATE issues SET return_date = CURRENT_DATE WHERE issue_id = ?",
		[issueId]
	);

	return result.affectedRows;
}

// Joined issue details by id.
async function getIssueById(issueId, executor = pool) {
	const [rows] = await executor.query(
		`SELECT
			i.issue_id,
			i.book_id,
			b.title,
			i.member_id,
			m.name AS member_name,
			i.issue_date,
			i.due_date,
			i.return_date
		 FROM issues i
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 WHERE i.issue_id = ?`,
		[issueId]
	);

	return rows[0] || null;
}

// Joined list of all issues.
async function getAllIssues(executor = pool) {
	const [rows] = await executor.query(
		`SELECT
			i.issue_id,
			i.book_id,
			b.title,
			i.member_id,
			m.name AS member_name,
			i.issue_date,
			i.due_date,
			i.return_date
		 FROM issues i
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 ORDER BY i.issue_id DESC`
	);

	return rows;
}

// Joined list of all issues with optional sorting/pagination.
async function getIssuesForListing(options = {}, executor = pool) {
	const sortColumn = resolveIssueSortColumn(options.sortBy);
	const sortDirection = options.sortOrder === "ASC" ? "ASC" : "DESC";

	const params = [];
	let limitSql = "";

	if (Number.isInteger(options.limit) && options.limit > 0) {
		limitSql = " LIMIT ? OFFSET ?";
		params.push(options.limit, options.offset || 0);
	}

	const [rows] = await executor.query(
		`SELECT
			i.issue_id,
			i.book_id,
			b.title,
			i.member_id,
			m.name AS member_name,
			i.issue_date,
			i.due_date,
			i.return_date
		 FROM issues i
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 ORDER BY ${sortColumn} ${sortDirection}${limitSql}`,
		params
	);

	return rows;
}

// Counts issue rows for paginated responses.
async function countIssuesForListing(executor = pool) {
	const [rows] = await executor.query("SELECT COUNT(*) AS total FROM issues");
	return rows[0].total;
}

// Joined list of active issues only.
async function getActiveIssues(executor = pool) {
	const [rows] = await executor.query(
		`SELECT
			i.issue_id,
			i.book_id,
			b.title,
			i.member_id,
			m.name AS member_name,
			i.issue_date,
			i.due_date,
			i.return_date
		 FROM issues i
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 WHERE i.return_date IS NULL
		 ORDER BY i.issue_id DESC`
	);

	return rows;
}

// Reporting: most issued books.
async function getMostIssuedBooks(limit = null, executor = pool) {
	const params = [];
	let limitSql = "";

	if (Number.isInteger(limit) && limit > 0) {
		limitSql = " LIMIT ?";
		params.push(limit);
	}

	const [rows] = await executor.query(
		`SELECT
			i.book_id,
			b.title,
			COUNT(*) AS issue_count
		 FROM issues i
		 JOIN books b ON i.book_id = b.book_id
		 GROUP BY i.book_id, b.title
		 ORDER BY issue_count DESC, i.book_id ASC${limitSql}`,
		params
	);

	return rows;
}

// Reporting: members with most borrowings.
async function getTopBorrowingMembers(limit = null, executor = pool) {
	const params = [];
	let limitSql = "";

	if (Number.isInteger(limit) && limit > 0) {
		limitSql = " LIMIT ?";
		params.push(limit);
	}

	const [rows] = await executor.query(
		`SELECT
			i.member_id,
			m.name,
			COUNT(*) AS total_issues
		 FROM issues i
		 JOIN members m ON i.member_id = m.member_id
		 GROUP BY i.member_id, m.name
		 ORDER BY total_issues DESC, i.member_id ASC${limitSql}`,
		params
	);

	return rows;
}

// Reporting: total amount of paid fines.
async function getTotalFinesCollected(executor = pool) {
	const [rows] = await executor.query(
		`SELECT COALESCE(SUM(amount), 0) AS total_fines_collected
		 FROM fines
		 WHERE paid = TRUE`
	);

	return rows[0];
}

module.exports = {
	getConnection,
	findBookById,
	findMemberById,
	createIssue,
	getIssueRowById,
	markIssueAsReturned,
	getIssueById,
	getAllIssues,
	getIssuesForListing,
	countIssuesForListing,
	getActiveIssues,
	getMostIssuedBooks,
	getTopBorrowingMembers,
	getTotalFinesCollected,
};

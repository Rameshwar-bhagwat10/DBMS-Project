const pool = require("../config/db");

// Checks if a book exists.
async function findBookById(bookId) {
	const [rows] = await pool.query("SELECT book_id FROM books WHERE book_id = ?", [bookId]);
	return rows[0] || null;
}

// Checks if a member exists.
async function findMemberById(memberId) {
	const [rows] = await pool.query("SELECT member_id FROM members WHERE member_id = ?", [memberId]);
	return rows[0] || null;
}

// Creates a new issue row. Stock handling is delegated to triggers.
async function createIssue(bookId, memberId, days) {
	const [result] = await pool.query(
		`INSERT INTO issues (book_id, member_id, issue_date, due_date)
		 VALUES (?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL ? DAY))`,
		[bookId, memberId, days]
	);

	return result.insertId;
}

// Raw issue row by id.
async function getIssueRowById(issueId) {
	const [rows] = await pool.query(
		`SELECT issue_id, book_id, member_id, issue_date, due_date, return_date
		 FROM issues
		 WHERE issue_id = ?`,
		[issueId]
	);

	return rows[0] || null;
}

// Marks issue as returned. Stock/fine changes are delegated to triggers.
async function markIssueAsReturned(issueId) {
	const [result] = await pool.query(
		"UPDATE issues SET return_date = CURRENT_DATE WHERE issue_id = ?",
		[issueId]
	);

	return result.affectedRows;
}

// Joined issue details by id.
async function getIssueById(issueId) {
	const [rows] = await pool.query(
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
async function getAllIssues() {
	const [rows] = await pool.query(
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

// Joined list of active issues only.
async function getActiveIssues() {
	const [rows] = await pool.query(
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

module.exports = {
	findBookById,
	findMemberById,
	createIssue,
	getIssueRowById,
	markIssueAsReturned,
	getIssueById,
	getAllIssues,
	getActiveIssues,
};

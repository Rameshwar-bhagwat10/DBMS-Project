const pool = require("../config/db");

// Checks if a member exists.
async function findMemberById(memberId) {
	const [rows] = await pool.query("SELECT member_id FROM members WHERE member_id = ?", [memberId]);
	return rows[0] || null;
}

// Returns all fines with book and member details.
async function getAllFines() {
	const [rows] = await pool.query(
		`SELECT
			f.fine_id,
			f.amount,
			f.paid,
			b.title,
			m.name,
			i.issue_id
		 FROM fines f
		 JOIN issues i ON f.issue_id = i.issue_id
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 ORDER BY f.fine_id DESC`
	);

	return rows;
}

// Returns unpaid fines only.
async function getUnpaidFines() {
	const [rows] = await pool.query(
		`SELECT
			f.fine_id,
			f.amount,
			f.paid,
			b.title,
			m.name,
			i.issue_id
		 FROM fines f
		 JOIN issues i ON f.issue_id = i.issue_id
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 WHERE f.paid = FALSE
		 ORDER BY f.fine_id DESC`
	);

	return rows;
}

// Returns one fine by issue id.
async function getFineByIssueId(issueId) {
	const [rows] = await pool.query(
		`SELECT
			f.fine_id,
			f.amount,
			f.paid,
			b.title,
			m.name,
			i.issue_id
		 FROM fines f
		 JOIN issues i ON f.issue_id = i.issue_id
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 WHERE i.issue_id = ?
		 LIMIT 1`,
		[issueId]
	);

	return rows[0] || null;
}

// Returns one fine by fine id.
async function getFineById(fineId) {
	const [rows] = await pool.query(
		`SELECT
			f.fine_id,
			f.amount,
			f.paid,
			b.title,
			m.name,
			i.issue_id
		 FROM fines f
		 JOIN issues i ON f.issue_id = i.issue_id
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 WHERE f.fine_id = ?
		 LIMIT 1`,
		[fineId]
	);

	return rows[0] || null;
}

// Marks fine as paid.
async function markFineAsPaid(fineId) {
	const [result] = await pool.query(
		`UPDATE fines
		 SET paid = TRUE
		 WHERE fine_id = ?`,
		[fineId]
	);

	return result.affectedRows;
}

// Returns all fines for one member.
async function getFinesByMemberId(memberId) {
	const [rows] = await pool.query(
		`SELECT
			f.fine_id,
			f.amount,
			f.paid,
			b.title,
			m.name,
			i.issue_id
		 FROM fines f
		 JOIN issues i ON f.issue_id = i.issue_id
		 JOIN books b ON i.book_id = b.book_id
		 JOIN members m ON i.member_id = m.member_id
		 WHERE m.member_id = ?
		 ORDER BY f.fine_id DESC`,
		[memberId]
	);

	return rows;
}

module.exports = {
	findMemberById,
	getAllFines,
	getUnpaidFines,
	getFineByIssueId,
	getFineById,
	markFineAsPaid,
	getFinesByMemberId,
};

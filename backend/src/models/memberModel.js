const pool = require("../config/db");

function resolveMemberSortColumn(sortBy) {
	const sortMap = {
		member_id: "m.member_id",
		name: "m.name",
		email: "m.email",
		membership_date: "m.membership_date",
	};

	return sortMap[sortBy] || sortMap.member_id;
}

// Creates member record.
async function insertMember(memberData) {
	const [result] = await pool.query(
		"INSERT INTO members (name, email, phone) VALUES (?, ?, ?)",
		[memberData.name, memberData.email, memberData.phone]
	);

	return result.insertId;
}

// Finds member by email with optional id exclusion for update checks.
async function findMemberByEmail(email, excludeMemberId = null) {
	let query = "SELECT member_id FROM members WHERE email = ?";
	const params = [email];

	if (excludeMemberId !== null) {
		query += " AND member_id <> ?";
		params.push(excludeMemberId);
	}

	const [rows] = await pool.query(query, params);
	return rows[0] || null;
}

// Gets all members.
async function getAllMembers() {
	const [rows] = await pool.query(
		`SELECT member_id, name, email, phone, membership_date
		 FROM members
		 ORDER BY member_id`
	);

	return rows;
}

// Gets members with optional sorting and pagination.
async function getMembersForListing(options = {}) {
	const sortColumn = resolveMemberSortColumn(options.sortBy);
	const sortDirection = options.sortOrder === "DESC" ? "DESC" : "ASC";

	const params = [];
	let limitSql = "";

	if (Number.isInteger(options.limit) && options.limit > 0) {
		limitSql = " LIMIT ? OFFSET ?";
		params.push(options.limit, options.offset || 0);
	}

	const [rows] = await pool.query(
		`SELECT m.member_id, m.name, m.email, m.phone, m.membership_date
		 FROM members m
		 ORDER BY ${sortColumn} ${sortDirection}${limitSql}`,
		params
	);

	return rows;
}

// Counts total members for paginated responses.
async function countMembersForListing() {
	const [rows] = await pool.query("SELECT COUNT(*) AS total FROM members");
	return rows[0].total;
}

// Gets member by id.
async function getMemberById(memberId) {
	const [rows] = await pool.query(
		`SELECT member_id, name, email, phone, membership_date
		 FROM members
		 WHERE member_id = ?`,
		[memberId]
	);

	return rows[0] || null;
}

// Gets borrowing history with book details.
async function getMemberBorrowingHistory(memberId) {
	const [rows] = await pool.query(
		`SELECT
			b.title,
			i.issue_date,
			i.return_date
		 FROM issues i
		 JOIN books b ON i.book_id = b.book_id
		 WHERE i.member_id = ?
		 ORDER BY i.issue_date DESC`,
		[memberId]
	);

	return rows;
}

// Checks whether member has any issue records.
async function getMemberIssues(memberId) {
	const [rows] = await pool.query(
		`SELECT issue_id, book_id, issue_date, due_date, return_date
		 FROM issues
		 WHERE member_id = ?`,
		[memberId]
	);

	return rows;
}

// Updates member fields.
async function updateMember(memberId, memberData) {
	const [result] = await pool.query(
		`UPDATE members
		 SET name = ?, email = ?, phone = ?
		 WHERE member_id = ?`,
		[memberData.name, memberData.email, memberData.phone, memberId]
	);

	return result.affectedRows;
}

// Deletes member by id.
async function deleteMember(memberId) {
	const [result] = await pool.query("DELETE FROM members WHERE member_id = ?", [memberId]);
	return result.affectedRows;
}

module.exports = {
	insertMember,
	findMemberByEmail,
	getAllMembers,
	getMembersForListing,
	countMembersForListing,
	getMemberById,
	getMemberBorrowingHistory,
	getMemberIssues,
	updateMember,
	deleteMember,
};

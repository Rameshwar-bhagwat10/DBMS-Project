const issueModel = require("../models/issueModel");

const MAX_PAGE_SIZE = 100;
const ISSUE_SORT_FIELDS = new Set([
	"issue_id",
	"issue_date",
	"due_date",
	"return_date",
	"title",
	"member_name",
]);

// Builds consistent operational errors for middleware formatting.
function createError(message, statusCode = 400) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

// Validates and parses numeric ids.
function parsePositiveInt(value, fieldName) {
	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw createError(`${fieldName} must be a positive integer`, 400);
	}

	return parsed;
}

function parsePaginationOptions(queryParams = {}) {
	const hasPage = queryParams.page !== undefined;
	const hasLimit = queryParams.limit !== undefined;

	if (!hasPage && !hasLimit) {
		return {
			paginated: false,
			page: 1,
			limit: null,
			offset: 0,
		};
	}

	const page = parsePositiveInt(hasPage ? queryParams.page : 1, "page");
	const limit = parsePositiveInt(hasLimit ? queryParams.limit : 10, "limit");

	if (limit > MAX_PAGE_SIZE) {
		throw createError(`limit must be less than or equal to ${MAX_PAGE_SIZE}`, 400);
	}

	return {
		paginated: true,
		page,
		limit,
		offset: (page - 1) * limit,
	};
}

function parseSortOptions(queryParams = {}) {
	const sortBy =
		queryParams.sort !== undefined ? String(queryParams.sort).trim().toLowerCase() : "issue_id";

	if (!ISSUE_SORT_FIELDS.has(sortBy)) {
		throw createError(`sort must be one of: ${Array.from(ISSUE_SORT_FIELDS).join(", ")}`, 400);
	}

	const sortOrder =
		queryParams.order !== undefined ? String(queryParams.order).trim().toUpperCase() : "DESC";

	if (sortOrder !== "ASC" && sortOrder !== "DESC") {
		throw createError("order must be either ASC or DESC", 400);
	}

	return {
		sortBy,
		sortOrder,
	};
}

function parseOptionalReportLimit(queryParams = {}) {
	if (queryParams.limit === undefined) {
		return null;
	}

	const limit = parsePositiveInt(queryParams.limit, "limit");

	if (limit > MAX_PAGE_SIZE) {
		throw createError(`limit must be less than or equal to ${MAX_PAGE_SIZE}`, 400);
	}

	return limit;
}

function buildPaginatedResponse(items, pagination, totalItems) {
	return {
		items,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total_items: totalItems,
			total_pages: totalItems === 0 ? 0 : Math.ceil(totalItems / pagination.limit),
		},
	};
}

// Validates issue payload.
function validateIssuePayload(payload) {
	const bookId = parsePositiveInt(payload.book_id, "book_id");
	const memberId = parsePositiveInt(payload.member_id, "member_id");
	const days = parsePositiveInt(payload.days, "days");

	return {
		bookId,
		memberId,
		days,
	};
}

// Creates issue record. Stock checks and decrement are trigger-driven.
async function issueBook(payload) {
	const data = validateIssuePayload(payload);
	const connection = await issueModel.getConnection();
	let transactionStarted = false;

	try {
		await connection.beginTransaction();
		transactionStarted = true;

		const book = await issueModel.findBookById(data.bookId, connection);
		if (!book) {
			throw createError("Book not found", 404);
		}

		const member = await issueModel.findMemberById(data.memberId, connection);
		if (!member) {
			throw createError("Member not found", 404);
		}

		const issueId = await issueModel.createIssue(data.bookId, data.memberId, data.days, connection);
		const issue = await issueModel.getIssueById(issueId, connection);

		await connection.commit();
		transactionStarted = false;

		return issue;
	} catch (error) {
		if (transactionStarted) {
			try {
				await connection.rollback();
			} catch (rollbackError) {
				// Keep original application error as primary failure.
			}
		}

		if (error.sqlState === "45000") {
			throw createError(error.sqlMessage || "Issue operation failed", 409);
		}

		throw error;
	} finally {
		connection.release();
	}
}

// Marks issue as returned. Stock increment and fine generation are trigger-driven.
async function returnBook(issueIdParam) {
	const issueId = parsePositiveInt(issueIdParam, "issue_id");
	const issueRow = await issueModel.getIssueRowById(issueId);

	if (!issueRow) {
		throw createError("Issue not found", 404);
	}

	if (issueRow.return_date !== null) {
		throw createError("Book already returned", 409);
	}

	await issueModel.markIssueAsReturned(issueId);
	const issue = await issueModel.getIssueById(issueId);
	return issue;
}

// Returns joined list of all issues.
async function getAllIssues(queryParams = {}) {
	const pagination = parsePaginationOptions(queryParams);
	const sort = parseSortOptions(queryParams);

	const issues = await issueModel.getIssuesForListing({
		sortBy: sort.sortBy,
		sortOrder: sort.sortOrder,
		limit: pagination.limit,
		offset: pagination.offset,
	});

	if (!pagination.paginated) {
		return issues;
	}

	const totalItems = await issueModel.countIssuesForListing();
	return buildPaginatedResponse(issues, pagination, totalItems);
}

// Returns joined list of active issues.
async function getActiveIssues() {
	return issueModel.getActiveIssues();
}

// Reporting: most issued books.
async function getMostIssuedBooksReport(queryParams = {}) {
	const limit = parseOptionalReportLimit(queryParams);
	return issueModel.getMostIssuedBooks(limit);
}

// Reporting: members with most borrowings.
async function getTopBorrowingMembersReport(queryParams = {}) {
	const limit = parseOptionalReportLimit(queryParams);
	return issueModel.getTopBorrowingMembers(limit);
}

// Reporting: total paid fines collected.
async function getTotalFinesCollectedReport() {
	return issueModel.getTotalFinesCollected();
}

// Returns one issue by id.
async function getIssueById(issueIdParam) {
	const issueId = parsePositiveInt(issueIdParam, "issue_id");
	const issue = await issueModel.getIssueById(issueId);

	if (!issue) {
		throw createError("Issue not found", 404);
	}

	return issue;
}

module.exports = {
	issueBook,
	returnBook,
	getAllIssues,
	getActiveIssues,
	getMostIssuedBooksReport,
	getTopBorrowingMembersReport,
	getTotalFinesCollectedReport,
	getIssueById,
};

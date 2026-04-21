const memberModel = require("../models/memberModel");

const MAX_PAGE_SIZE = 100;
const MEMBER_SORT_FIELDS = new Set(["member_id", "name", "email", "membership_date"]);

// Builds consistent operational errors for middleware formatting.
function createError(message, statusCode = 400) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

// Validates and parses member id from route params.
function parseMemberId(id) {
	const memberId = Number(id);

	if (!Number.isInteger(memberId) || memberId <= 0) {
		throw createError("Invalid member id", 400);
	}

	return memberId;
}

function parsePositiveInteger(value, fieldName) {
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

	const page = parsePositiveInteger(hasPage ? queryParams.page : 1, "page");
	const limit = parsePositiveInteger(hasLimit ? queryParams.limit : 10, "limit");

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
		queryParams.sort !== undefined ? String(queryParams.sort).trim().toLowerCase() : "member_id";

	if (!MEMBER_SORT_FIELDS.has(sortBy)) {
		throw createError(`sort must be one of: ${Array.from(MEMBER_SORT_FIELDS).join(", ")}`, 400);
	}

	const sortOrder =
		queryParams.order !== undefined ? String(queryParams.order).trim().toUpperCase() : "ASC";

	if (sortOrder !== "ASC" && sortOrder !== "DESC") {
		throw createError("order must be either ASC or DESC", 400);
	}

	return {
		sortBy,
		sortOrder,
	};
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

function normalizeText(value) {
	if (value === undefined || value === null) {
		return null;
	}

	const text = String(value).trim();
	return text.length > 0 ? text : null;
}

function validateEmail(email) {
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email);
}

// Validates payload for create flow.
function validateCreatePayload(payload) {
	const name = normalizeText(payload.name);
	const email = normalizeText(payload.email);
	const phone = normalizeText(payload.phone);

	if (!name) {
		throw createError("name is required", 400);
	}

	if (!email) {
		throw createError("email is required", 400);
	}

	if (!validateEmail(email)) {
		throw createError("email format is invalid", 400);
	}

	return {
		name,
		email,
		phone,
	};
}

// Validates payload for update flow.
function validateUpdatePayload(existingMember, payload) {
	const hasAnyField = payload.name !== undefined || payload.email !== undefined || payload.phone !== undefined;

	if (!hasAnyField) {
		throw createError("No valid fields provided for update", 400);
	}

	const name = payload.name !== undefined ? normalizeText(payload.name) : existingMember.name;
	const email = payload.email !== undefined ? normalizeText(payload.email) : existingMember.email;
	const phone = payload.phone !== undefined ? normalizeText(payload.phone) : existingMember.phone;

	if (!name) {
		throw createError("name is required", 400);
	}

	if (!email) {
		throw createError("email is required", 400);
	}

	if (!validateEmail(email)) {
		throw createError("email format is invalid", 400);
	}

	return {
		name,
		email,
		phone,
	};
}

async function createMember(payload) {
	const data = validateCreatePayload(payload);

	const existingEmail = await memberModel.findMemberByEmail(data.email);
	if (existingEmail) {
		throw createError("Member with this email already exists", 409);
	}

	try {
		const memberId = await memberModel.insertMember(data);
		const member = await memberModel.getMemberById(memberId);
		return member;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw createError("Member with this email already exists", 409);
		}

		throw error;
	}
}

async function getAllMembers(queryParams = {}) {
	const pagination = parsePaginationOptions(queryParams);
	const sort = parseSortOptions(queryParams);

	const members = await memberModel.getMembersForListing({
		sortBy: sort.sortBy,
		sortOrder: sort.sortOrder,
		limit: pagination.limit,
		offset: pagination.offset,
	});

	if (!pagination.paginated) {
		return members;
	}

	const totalItems = await memberModel.countMembersForListing();
	return buildPaginatedResponse(members, pagination, totalItems);
}

async function getMemberById(id) {
	const memberId = parseMemberId(id);
	const member = await memberModel.getMemberById(memberId);

	if (!member) {
		throw createError("Member not found", 404);
	}

	return member;
}

async function getMemberHistory(id) {
	const memberId = parseMemberId(id);
	const member = await memberModel.getMemberById(memberId);

	if (!member) {
		throw createError("Member not found", 404);
	}

	const history = await memberModel.getMemberBorrowingHistory(memberId);

	return {
		member,
		history,
	};
}

async function updateMember(id, payload) {
	const memberId = parseMemberId(id);
	const existingMember = await memberModel.getMemberById(memberId);

	if (!existingMember) {
		throw createError("Member not found", 404);
	}

	const data = validateUpdatePayload(existingMember, payload);

	const existingEmail = await memberModel.findMemberByEmail(data.email, memberId);
	if (existingEmail) {
		throw createError("Member with this email already exists", 409);
	}

	try {
		await memberModel.updateMember(memberId, data);
		const updatedMember = await memberModel.getMemberById(memberId);
		return updatedMember;
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY") {
			throw createError("Member with this email already exists", 409);
		}

		throw error;
	}
}

async function deleteMember(id) {
	const memberId = parseMemberId(id);
	const member = await memberModel.getMemberById(memberId);

	if (!member) {
		throw createError("Member not found", 404);
	}

	const issues = await memberModel.getMemberIssues(memberId);
	if (issues.length > 0) {
		throw createError("Cannot delete member because borrowing history exists for this member", 409);
	}

	await memberModel.deleteMember(memberId);

	return {
		member_id: memberId,
	};
}

module.exports = {
	createMember,
	getAllMembers,
	getMemberById,
	getMemberHistory,
	updateMember,
	deleteMember,
};

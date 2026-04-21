// Builds consistent operational errors for validation failures.
function createError(message, statusCode = 400) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

function normalizeText(value) {
	if (value === undefined || value === null) {
		return "";
	}

	return String(value).trim();
}

function isPositiveInteger(value) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0;
}

function isNonNegativeInteger(value) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0;
}

function isValidEmail(email) {
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailPattern.test(email);
}

// Generic route-param id validator to keep invalid ids away from controllers/services.
function validateIdParam(paramName = "id", fieldName = "id") {
	return function validateId(req, res, next) {
		try {
			const value = req.params[paramName];

			if (value === undefined || value === null || normalizeText(value) === "") {
				throw createError(`${fieldName} is required`, 400);
			}

			if (!isPositiveInteger(value)) {
				throw createError(`${fieldName} must be a positive integer`, 400);
			}

			return next();
		} catch (error) {
			return next(error);
		}
	};
}

// Book validation (create).
function validateBook(req, res, next) {
	try {
		const title = normalizeText(req.body.title);
		const totalCopies = req.body.total_copies;
		const authors = req.body.authors;

		if (!title) {
			throw createError("title is required", 400);
		}

		if (!isNonNegativeInteger(totalCopies)) {
			throw createError("total_copies must be an integer greater than or equal to 0", 400);
		}

		if (!Array.isArray(authors) || authors.length === 0) {
			throw createError("authors must be a non-empty array", 400);
		}

		const nonEmptyAuthors = authors.filter((author) => normalizeText(author) !== "");
		if (nonEmptyAuthors.length === 0) {
			throw createError("authors must contain at least one valid name", 400);
		}

		return next();
	} catch (error) {
		return next(error);
	}
}

// Book validation (update/partial update).
function validateBookUpdate(req, res, next) {
	try {
		const hasAnyField =
			req.body.title !== undefined ||
			req.body.isbn !== undefined ||
			req.body.publisher !== undefined ||
			req.body.total_copies !== undefined ||
			req.body.authors !== undefined;

		if (!hasAnyField) {
			throw createError("No valid fields provided for update", 400);
		}

		if (req.body.title !== undefined && normalizeText(req.body.title) === "") {
			throw createError("title is required", 400);
		}

		if (req.body.total_copies !== undefined && !isNonNegativeInteger(req.body.total_copies)) {
			throw createError("total_copies must be an integer greater than or equal to 0", 400);
		}

		if (req.body.authors !== undefined) {
			if (!Array.isArray(req.body.authors) || req.body.authors.length === 0) {
				throw createError("authors must be a non-empty array", 400);
			}

			const nonEmptyAuthors = req.body.authors.filter((author) => normalizeText(author) !== "");
			if (nonEmptyAuthors.length === 0) {
				throw createError("authors must contain at least one valid name", 400);
			}
		}

		return next();
	} catch (error) {
		return next(error);
	}
}

// Member validation (create).
function validateMember(req, res, next) {
	try {
		const name = normalizeText(req.body.name);
		const email = normalizeText(req.body.email);

		if (!name) {
			throw createError("name is required", 400);
		}

		if (!email) {
			throw createError("email is required", 400);
		}

		if (!isValidEmail(email)) {
			throw createError("email format is invalid", 400);
		}

		return next();
	} catch (error) {
		return next(error);
	}
}

// Member validation (update/partial update).
function validateMemberUpdate(req, res, next) {
	try {
		const hasAnyField =
			req.body.name !== undefined || req.body.email !== undefined || req.body.phone !== undefined;

		if (!hasAnyField) {
			throw createError("No valid fields provided for update", 400);
		}

		if (req.body.name !== undefined && normalizeText(req.body.name) === "") {
			throw createError("name is required", 400);
		}

		if (req.body.email !== undefined) {
			const email = normalizeText(req.body.email);

			if (!email) {
				throw createError("email is required", 400);
			}

			if (!isValidEmail(email)) {
				throw createError("email format is invalid", 400);
			}
		}

		return next();
	} catch (error) {
		return next(error);
	}
}

// Issue validation.
function validateIssue(req, res, next) {
	try {
		if (!isPositiveInteger(req.body.book_id)) {
			throw createError("book_id must be a positive integer", 400);
		}

		if (!isPositiveInteger(req.body.member_id)) {
			throw createError("member_id must be a positive integer", 400);
		}

		if (!isPositiveInteger(req.body.days)) {
			throw createError("days must be a positive integer", 400);
		}

		return next();
	} catch (error) {
		return next(error);
	}
}

// Fine validation for payment route.
function validateFinePay(req, res, next) {
	try {
		const fineId = req.params.id;

		if (fineId === undefined || fineId === null || normalizeText(fineId) === "") {
			throw createError("fine_id is required", 400);
		}

		if (!isPositiveInteger(fineId)) {
			throw createError("fine_id must be a positive integer", 400);
		}

		return next();
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	validateIdParam,
	validateBook,
	validateBookUpdate,
	validateMember,
	validateMemberUpdate,
	validateIssue,
	validateFinePay,
};

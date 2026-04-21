const bookModel = require("../models/bookModel");

const MAX_PAGE_SIZE = 100;
const BOOK_SORT_FIELDS = new Set([
	"book_id",
	"title",
	"publisher",
	"total_copies",
	"available_copies",
]);

// Builds consistent operational errors for middleware to format.
function createError(message, statusCode = 400) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

// Validates and parses :id route param.
function parseBookId(id) {
	const bookId = Number(id);

	if (!Number.isInteger(bookId) || bookId <= 0) {
		throw createError("Invalid book id", 400);
	}

	return bookId;
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

function parseSortOptions(queryParams, allowedSortFields, defaultSortField) {
	const sortBy =
		queryParams.sort !== undefined ? String(queryParams.sort).trim().toLowerCase() : defaultSortField;

	if (!allowedSortFields.has(sortBy)) {
		throw createError(`sort must be one of: ${Array.from(allowedSortFields).join(", ")}`, 400);
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

function parseBooleanFilter(value, fieldName) {
	if (value === undefined || value === null) {
		return null;
	}

	const normalized = String(value).trim().toLowerCase();

	if (normalized === "true" || normalized === "1" || normalized === "yes") {
		return true;
	}

	if (normalized === "false" || normalized === "0" || normalized === "no") {
		return false;
	}

	throw createError(`${fieldName} must be either true or false`, 400);
}

function parseOptionalTextQuery(value, fieldName) {
	if (value === undefined || value === null) {
		return null;
	}

	const text = String(value).trim();

	if (!text) {
		throw createError(`${fieldName} cannot be empty`, 400);
	}

	return text;
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

// Trims values and converts empty text to null.
function normalizeText(value) {
	if (value === undefined || value === null) {
		return null;
	}

	const text = String(value).trim();
	return text.length > 0 ? text : null;
}

// Removes blank/duplicate author names (case-insensitive).
function normalizeAuthors(authors) {
	if (!Array.isArray(authors)) {
		return [];
	}

	const uniqueMap = new Map();

	authors.forEach((author) => {
		const name = normalizeText(author);

		if (!name) {
			return;
		}

		const key = name.toLowerCase();
		if (!uniqueMap.has(key)) {
			uniqueMap.set(key, name);
		}
	});

	return Array.from(uniqueMap.values());
}

// Converts DB row shape to API response shape.
function toBookResponse(bookRow) {
	return {
		book_id: bookRow.book_id,
		title: bookRow.title,
		isbn: bookRow.isbn,
		publisher: bookRow.publisher,
		total_copies: bookRow.total_copies,
		available_copies: bookRow.available_copies,
		authors: bookRow.authors ? bookRow.authors.split(",") : [],
	};
}

// Ensures every author exists and links it with the target book.
async function attachAuthorsToBook(connection, bookId, authorNames) {
	for (const authorName of authorNames) {
		let author = await bookModel.findAuthorByName(connection, authorName);

		if (!author) {
			const authorId = await bookModel.insertAuthor(connection, authorName);
			author = { author_id: authorId };
		}

		await bookModel.insertBookAuthor(connection, bookId, author.author_id);
	}
}

// Validates payload for create flow.
function validateCreatePayload(payload) {
	const title = normalizeText(payload.title);
	const isbn = normalizeText(payload.isbn);
	const publisher = normalizeText(payload.publisher);
	const totalCopies = Number(payload.total_copies);
	const authors = normalizeAuthors(payload.authors);

	if (!title) {
		throw createError("title is required", 400);
	}

	if (!Number.isInteger(totalCopies) || totalCopies < 0) {
		throw createError("total_copies must be an integer greater than or equal to 0", 400);
	}

	if (authors.length === 0) {
		throw createError("authors must be a non-empty array", 400);
	}

	return {
		title,
		isbn,
		publisher,
		total_copies: totalCopies,
		available_copies: totalCopies,
		authors,
	};
}

// Validates payload for update flow and keeps issued-copies logic safe.
function validateUpdatePayload(existingBook, payload) {
	const hasAnyField =
		payload.title !== undefined ||
		payload.isbn !== undefined ||
		payload.publisher !== undefined ||
		payload.total_copies !== undefined ||
		payload.authors !== undefined;

	if (!hasAnyField) {
		throw createError("No valid fields provided for update", 400);
	}

	const title = payload.title !== undefined ? normalizeText(payload.title) : existingBook.title;
	const isbn = payload.isbn !== undefined ? normalizeText(payload.isbn) : existingBook.isbn;
	const publisher =
		payload.publisher !== undefined ? normalizeText(payload.publisher) : existingBook.publisher;

	if (!title) {
		throw createError("title is required", 400);
	}

	let totalCopies = existingBook.total_copies;
	let availableCopies = existingBook.available_copies;

	if (payload.total_copies !== undefined) {
		const parsedTotal = Number(payload.total_copies);

		if (!Number.isInteger(parsedTotal) || parsedTotal < 0) {
			throw createError("total_copies must be an integer greater than or equal to 0", 400);
		}

		const issuedCopies = existingBook.total_copies - existingBook.available_copies;
		if (parsedTotal < issuedCopies) {
			throw createError("total_copies cannot be less than currently issued copies", 400);
		}

		totalCopies = parsedTotal;
		availableCopies = parsedTotal - issuedCopies;
	}

	let authors = null;
	if (payload.authors !== undefined) {
		authors = normalizeAuthors(payload.authors);

		if (authors.length === 0) {
			throw createError("authors must be a non-empty array", 400);
		}
	}

	return {
		title,
		isbn,
		publisher,
		total_copies: totalCopies,
		available_copies: availableCopies,
		authors,
	};
}

// CREATE: transactionally insert book + authors + junction mappings.
async function createBook(payload) {
	const data = validateCreatePayload(payload);

	if (data.isbn) {
		const isbnBook = await bookModel.findBookByIsbn(data.isbn);
		if (isbnBook) {
			throw createError("Book with this ISBN already exists", 409);
		}
	}

	const connection = await bookModel.getConnection();
	let transactionStarted = false;

	try {
		// All related inserts must succeed together.
		await connection.beginTransaction();
		transactionStarted = true;

		const bookId = await bookModel.insertBook(connection, data);
		await attachAuthorsToBook(connection, bookId, data.authors);

		await connection.commit();
		transactionStarted = false;

		const createdBook = await bookModel.getBookById(bookId);
		return toBookResponse(createdBook);
	} catch (error) {
		// Revert partial writes when any step fails.
		if (transactionStarted) {
			try {
				await connection.rollback();
			} catch (rollbackError) {
				// Keep original application error as primary failure.
			}
		}

		if (error.code === "ER_DUP_ENTRY") {
			throw createError("Book with this ISBN already exists", 409);
		}

		throw error;
	} finally {
		connection.release();
	}
}

// READ ALL: fetch list with aggregated author names.
async function getAllBooks(queryParams = {}) {
	const pagination = parsePaginationOptions(queryParams);
	const sort = parseSortOptions(queryParams, BOOK_SORT_FIELDS, "book_id");

	const options = {
		available: parseBooleanFilter(queryParams.available, "available"),
		authorFilter: parseOptionalTextQuery(queryParams.author, "author"),
		searchTerm: null,
		sortBy: sort.sortBy,
		sortOrder: sort.sortOrder,
		limit: pagination.limit,
		offset: pagination.offset,
	};

	const rows = await bookModel.getBooksForListing(options);
	const books = rows.map(toBookResponse);

	if (!pagination.paginated) {
		return books;
	}

	const totalItems = await bookModel.countBooksForListing(options);
	return buildPaginatedResponse(books, pagination, totalItems);
}

// SEARCH: matches books by title or author name.
async function searchBooks(queryParams = {}) {
	const searchTerm = parseOptionalTextQuery(queryParams.query, "query");

	if (!searchTerm) {
		throw createError("query is required", 400);
	}

	const pagination = parsePaginationOptions(queryParams);
	const sort = parseSortOptions(queryParams, BOOK_SORT_FIELDS, "title");

	const options = {
		available: null,
		authorFilter: null,
		searchTerm,
		sortBy: sort.sortBy,
		sortOrder: sort.sortOrder,
		limit: pagination.limit,
		offset: pagination.offset,
	};

	const rows = await bookModel.getBooksForListing(options);
	const books = rows.map(toBookResponse);

	if (!pagination.paginated) {
		return books;
	}

	const totalItems = await bookModel.countBooksForListing(options);
	return buildPaginatedResponse(books, pagination, totalItems);
}

// READ ONE: validate id and return one book or 404.
async function getBookById(id) {
	const bookId = parseBookId(id);
	const book = await bookModel.getBookById(bookId);

	if (!book) {
		throw createError("Book not found", 404);
	}

	return toBookResponse(book);
}

// UPDATE: transactionally update book and refresh author mappings when supplied.
async function updateBook(id, payload) {
	const bookId = parseBookId(id);
	const connection = await bookModel.getConnection();
	let transactionStarted = false;

	try {
		// Lock and update in a single transaction to keep data consistent.
		await connection.beginTransaction();
		transactionStarted = true;

		const existingBook = await bookModel.getBookForUpdate(connection, bookId);
		if (!existingBook) {
			throw createError("Book not found", 404);
		}

		const data = validateUpdatePayload(existingBook, payload);

		if (data.isbn) {
			const isbnBook = await bookModel.findBookByIsbn(data.isbn, bookId, connection);
			if (isbnBook) {
				throw createError("Book with this ISBN already exists", 409);
			}
		}

		await bookModel.updateBook(connection, bookId, data);

		if (data.authors) {
			// Replace existing mappings with requested author set.
			await bookModel.deleteBookAuthors(connection, bookId);
			await attachAuthorsToBook(connection, bookId, data.authors);
		}

		await connection.commit();
		transactionStarted = false;

		const updatedBook = await bookModel.getBookById(bookId);
		return toBookResponse(updatedBook);
	} catch (error) {
		if (transactionStarted) {
			try {
				await connection.rollback();
			} catch (rollbackError) {
				// Keep original application error as primary failure.
			}
		}

		if (error.code === "ER_DUP_ENTRY") {
			throw createError("Book with this ISBN already exists", 409);
		}

		throw error;
	} finally {
		connection.release();
	}
}

// DELETE: remove book and surface friendly conflict errors.
async function deleteBook(id) {
	const bookId = parseBookId(id);
	const connection = await bookModel.getConnection();
	let transactionStarted = false;

	try {
		await connection.beginTransaction();
		transactionStarted = true;

		// Lock book row to avoid concurrent issue operations while deleting.
		const existingBook = await bookModel.getBookForUpdate(connection, bookId);
		if (!existingBook) {
			throw createError("Book not found", 404);
		}

		const activeIssuesCount = await bookModel.countActiveIssuesForBook(bookId, connection);
		if (activeIssuesCount > 0) {
			throw createError("Cannot delete this book because it is currently issued", 409);
		}

		// Book can be deleted once all issues are returned, so clear returned history for this book.
		await bookModel.deleteReturnedIssuesByBook(bookId, connection);

		const affectedRows = await bookModel.deleteBook(bookId, connection);

		if (affectedRows === 0) {
			throw createError("Book not found", 404);
		}

		await connection.commit();
		transactionStarted = false;

		return { book_id: bookId };
	} catch (error) {
		if (transactionStarted) {
			try {
				await connection.rollback();
			} catch (rollbackError) {
				// Keep original application error as primary failure.
			}
		}

		if (error.code === "ER_ROW_IS_REFERENCED_2") {
			throw createError("Cannot delete this book because it is currently issued", 409);
		}

		throw error;
	} finally {
		connection.release();
	}
}

module.exports = {
	createBook,
	getAllBooks,
	searchBooks,
	getBookById,
	updateBook,
	deleteBook,
};

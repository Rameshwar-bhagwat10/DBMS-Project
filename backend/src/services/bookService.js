const bookModel = require("../models/bookModel");

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

	try {
		// All related inserts must succeed together.
		await connection.beginTransaction();

		const bookId = await bookModel.insertBook(connection, data);
		await attachAuthorsToBook(connection, bookId, data.authors);

		await connection.commit();

		const createdBook = await bookModel.getBookById(bookId);
		return toBookResponse(createdBook);
	} catch (error) {
		// Revert partial writes when any step fails.
		await connection.rollback();

		if (error.code === "ER_DUP_ENTRY") {
			throw createError("Book with this ISBN already exists", 409);
		}

		throw error;
	} finally {
		connection.release();
	}
}

// READ ALL: fetch list with aggregated author names.
async function getAllBooks() {
	const books = await bookModel.getAllBooks();
	return books.map(toBookResponse);
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

	try {
		// Lock and update in a single transaction to keep data consistent.
		await connection.beginTransaction();

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

		const updatedBook = await bookModel.getBookById(bookId);
		return toBookResponse(updatedBook);
	} catch (error) {
		await connection.rollback();

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

	try {
		const affectedRows = await bookModel.deleteBook(bookId);

		if (affectedRows === 0) {
			throw createError("Book not found", 404);
		}

		return { book_id: bookId };
	} catch (error) {
		if (error.code === "ER_ROW_IS_REFERENCED_2") {
			throw createError("Cannot delete this book because issue records exist", 409);
		}

		throw error;
	}
}

module.exports = {
	createBook,
	getAllBooks,
	getBookById,
	updateBook,
	deleteBook,
};

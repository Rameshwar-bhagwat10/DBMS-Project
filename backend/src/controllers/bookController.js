const { sendSuccess } = require("../utils/responseHandler");
const bookService = require("../services/bookService");

// Create a new book and its author relationships.
async function createBook(req, res, next) {
	try {
		const book = await bookService.createBook(req.body);
		return sendSuccess(res, "Book created successfully", book);
	} catch (error) {
		return next(error);
	}
}

// Fetch all books with aggregated author names.
async function getAllBooks(req, res, next) {
	try {
		const books = await bookService.getAllBooks();
		return sendSuccess(res, "Books fetched successfully", books);
	} catch (error) {
		return next(error);
	}
}

// Fetch one book by id.
async function getBookById(req, res, next) {
	try {
		const book = await bookService.getBookById(req.params.id);
		return sendSuccess(res, "Book fetched successfully", book);
	} catch (error) {
		return next(error);
	}
}

// Update book fields and optionally replace author mappings.
async function updateBook(req, res, next) {
	try {
		const book = await bookService.updateBook(req.params.id, req.body);
		return sendSuccess(res, "Book updated successfully", book);
	} catch (error) {
		return next(error);
	}
}

// Delete book by id.
async function deleteBook(req, res, next) {
	try {
		const result = await bookService.deleteBook(req.params.id);
		return sendSuccess(res, "Book deleted successfully", result);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createBook,
	getAllBooks,
	getBookById,
	updateBook,
	deleteBook,
};

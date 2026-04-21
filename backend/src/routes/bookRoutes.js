const express = require("express");

const {
	createBook,
	getAllBooks,
	searchBooks,
	getBookById,
	updateBook,
	deleteBook,
} = require("../controllers/bookController");
const { validateBook, validateBookUpdate, validateIdParam } = require("../middlewares/validateMiddleware");

const router = express.Router();

// Book module routes: only maps HTTP endpoints to controller handlers.
router.post("/", validateBook, createBook);
router.get("/", getAllBooks);
router.get("/search", searchBooks);
router.get("/:id", validateIdParam("id", "book_id"), getBookById);
router.put("/:id", validateIdParam("id", "book_id"), validateBookUpdate, updateBook);
router.delete("/:id", validateIdParam("id", "book_id"), deleteBook);

module.exports = router;

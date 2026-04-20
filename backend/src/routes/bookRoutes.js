const express = require("express");

const {
	createBook,
	getAllBooks,
	getBookById,
	updateBook,
	deleteBook,
} = require("../controllers/bookController");

const router = express.Router();

// Book module routes: only maps HTTP endpoints to controller handlers.
router.post("/", createBook);
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

module.exports = router;

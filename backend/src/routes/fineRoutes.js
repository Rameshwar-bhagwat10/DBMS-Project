const express = require("express");

const {
	getAllFines,
	getUnpaidFines,
	getFineByIssueId,
	payFine,
	getMemberFines,
} = require("../controllers/fineController");
const { validateFinePay, validateIdParam } = require("../middlewares/validateMiddleware");

const router = express.Router();

// Fine module endpoints.
router.get("/", getAllFines);
router.get("/unpaid", getUnpaidFines);
router.get("/issue/:id", validateIdParam("id", "issue_id"), getFineByIssueId);
router.put("/:id/pay", validateFinePay, payFine);
router.get("/member/:id", validateIdParam("id", "member_id"), getMemberFines);

module.exports = router;

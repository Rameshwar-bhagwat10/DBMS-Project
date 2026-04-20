const express = require("express");

const { getTest } = require("../controllers/testController");

const router = express.Router();

// Health-check style endpoint to validate backend flow and DB connectivity.
router.get("/test", getTest);

module.exports = router;

const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const issueRoutes = require("./routes/issueRoutes");
const fineRoutes = require("./routes/fineRoutes");
const requireAuth = require("./middlewares/authMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Core middleware.
app.use(
	cors({
		origin: frontendOrigin,
		credentials: true,
	})
);
app.use(express.json());

// Public routes (no auth required).
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);

// All routes below this line require authentication.
app.use("/api", requireAuth);

// Book module endpoints.
app.use("/api/books", bookRoutes);
// Member module endpoints.
app.use("/api/members", memberRoutes);
// Issue module endpoints.
app.use("/api/issues", issueRoutes);
// Fine module endpoints.
app.use("/api/fines", fineRoutes);

// Keep error handler at the end of middleware chain.
app.use(errorMiddleware);

module.exports = app;

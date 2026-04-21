const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");
const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const issueRoutes = require("./routes/issueRoutes");
const fineRoutes = require("./routes/fineRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Core middleware.
app.use(cors());
app.use(express.json());

// API route prefix.
app.use("/api", testRoutes);
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

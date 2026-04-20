const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// Core middleware.
app.use(cors());
app.use(express.json());

// API route prefix.
app.use("/api", testRoutes);

// Keep error handler at the end of middleware chain.
app.use(errorMiddleware);

module.exports = app;

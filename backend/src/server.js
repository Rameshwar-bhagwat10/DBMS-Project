const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

// Start HTTP server.
app.listen(PORT, () => {
	console.log(`Server running on port http://localhost:${PORT}`);
});

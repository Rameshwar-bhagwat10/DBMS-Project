const pool = require("../config/db");

async function getHealthCheckResult() {
  // Model layer should contain DB query logic only.
  const [rows] = await pool.query("SELECT 1 AS result;");
  return rows[0];
}

module.exports = {
  getHealthCheckResult,
};

const { getHealthCheckResult } = require("../models/testModel");

async function fetchBackendStatus() {
  // Service layer is the place for business rules/composition.
  const result = await getHealthCheckResult();
  return result;
}

module.exports = {
  fetchBackendStatus,
};

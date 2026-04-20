const { sendSuccess } = require("../utils/responseHandler");
const { fetchBackendStatus } = require("../services/testService");

async function getTest(req, res, next) {
  try {
    // Controller delegates logic to service and formats HTTP response.
    const result = await fetchBackendStatus();
    return sendSuccess(res, "Backend working", result);
  } catch (error) {
    // Forward errors to global error middleware.
    return next(error);
  }
}

module.exports = {
  getTest,
};

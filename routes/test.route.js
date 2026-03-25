const express = require("express");
const router = express.Router();
const { autoExpirePlans } = require("../api/v1/cron/autoExpiredPlan");

router.post("/test-cron", async (req, res) => {
  await autoExpirePlans();
  res.send("Cron executed manually");
});

module.exports = router;
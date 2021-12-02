const express = require("express");
const { getDashboard } = require("../controllers/flow");
const ReturningVisitor = require("../models/ReturningVisitor");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, advancedResults(ReturningVisitor), getDashboard);

module.exports = router;

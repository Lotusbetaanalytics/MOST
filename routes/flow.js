const express = require("express");
const {
  getDashboard,
  deleteFrontdesk,
  deleteStaff,
} = require("../controllers/flow");
const ReturningVisitor = require("../models/ReturningVisitor");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, advancedResults(ReturningVisitor), getDashboard);

router.route("/frontdesk/:id").delete(deleteFrontdesk);
router.route("/staff/:id").delete(deleteStaff);

module.exports = router;

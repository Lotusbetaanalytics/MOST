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

router.route("/frontdesk").delete(protect, deleteFrontdesk);
router.route("/staff").delete(protect, deleteStaff);

module.exports = router;

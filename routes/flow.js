const express = require("express");
const {
  getDashboard,
  deleteFrontdesk,
  deleteStaff,
  getAdmin,
  getStaff,
  updateAdmin,
  updateStaff,
} = require("../controllers/flow");
const ReturningVisitor = require("../models/ReturningVisitor");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, advancedResults(ReturningVisitor), getDashboard);

router
  .route("/frontdesk/:id")
  .delete(deleteFrontdesk)
  .get(getAdmin)
  .put(updateAdmin);
router.route("/staff/:id").delete(deleteStaff).get(getStaff).put(updateStaff);

module.exports = router;

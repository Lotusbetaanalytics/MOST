const express = require("express");
const {
  getVisitors,
  newVisitor,
  approveVisitor,
  rejectVisitor,
  checkinVisitor,
  checkoutVisitor,
} = require("../controllers/oldGuest");
const { protect, authorize, protects } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").get(protect, getVisitors).post(protect, newVisitor);
router.route("/approve/:id").put(protects, approveVisitor);
router.route("/reject/:id").put(protects, rejectVisitor);
router.route("/checkin/:id").put(protects, checkinVisitor);
router.route("/checkout/:id").put(protects, checkoutVisitor);

module.exports = router;

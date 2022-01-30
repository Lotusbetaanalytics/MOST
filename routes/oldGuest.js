const express = require("express");
const { getVisitors, newVisitor } = require("../controllers/oldGuest");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").get(protect, getVisitors).post(protect, newVisitor);

module.exports = router;

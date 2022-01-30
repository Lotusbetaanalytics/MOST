const express = require("express");
const { newVisitor, getVisitors } = require("../controllers/newGuest");
const Frontdesk = require("../models/Frontdesk");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").post(protect, newVisitor).get(protect, getVisitors);

module.exports = router;

const express = require("express");
const { getLogs, getStaffLogs } = require("../controllers/log");
const { protects, protect } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").get(protect, getLogs);
router.route("/staffs").get(protects, getStaffLogs);

module.exports = router;

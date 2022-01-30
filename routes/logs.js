const express = require("express");
const { getLogs } = require("../controllers/log");
const { protect } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.route("/").get(protect, getLogs);

module.exports = router;

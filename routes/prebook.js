const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const { prebook, prebookSignin } = require("../controllers/prebook");

const router = express.Router();

router.route("/").post(prebook);
router.route("/checkin").post(prebookSignin);

module.exports = router;

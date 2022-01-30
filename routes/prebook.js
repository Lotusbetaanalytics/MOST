const express = require("express");
const { verifyToken, getPrebooks, prebook } = require("../controllers/prebook");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").post(protect, prebook).get(protect, getPrebooks);
router.route("/verify").post(protect, verifyToken);

module.exports = router;

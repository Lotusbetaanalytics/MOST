const express = require("express");
const { newVisitor, getVisitors } = require("../controllers/guestMost");
const router = express.Router();

router.route("/").post(newVisitor).get(getVisitors);

module.exports = router;

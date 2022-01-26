const express = require("express");
const { getVisitors, newVisitor } = require("../controllers/returningMost");
const router = express.Router();

router.route("/").get(getVisitors).post(newVisitor);

module.exports = router;

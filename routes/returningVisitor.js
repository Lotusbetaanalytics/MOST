const express = require("express");
const {
  addReturningVisitor,
  signoutVisitor,
} = require("../controllers/returningVisitor");
const router = express.Router();

router.route("/").post(addReturningVisitor);
router.route("/signout").post(signoutVisitor);

module.exports = router;

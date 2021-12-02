const express = require("express");
const {
  createFrontdesk,
  login,
  getMe,
  getFrontdesk,
} = require("../controllers/frontdesk");
const Frontdesk = require("../models/Frontdesk");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(createFrontdesk)
  .get(
    protect,
    authorize("Frontdesk", "Staff"),
    advancedResults(Frontdesk),
    getFrontdesk
  );
router.route("/login").post(login);
router.route("/me").get(protect, getMe);

module.exports = router;

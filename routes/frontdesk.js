const express = require("express");
const {
  createFrontdesk,
  login,
  getMe,
  getFrontdesk,
  forgotPassword,
  resetPassword,
  updateFrontdesk,
  deleteFrontdesk,
} = require("../controllers/frontdesk");
const Frontdesk = require("../models/Frontdesk");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, createFrontdesk)
  .get(
    protect,
    authorize("Admin", "SuperAdmin"),
    advancedResults(Frontdesk),
    getFrontdesk
  );
router.route("/login").post(login);
router.route("/me").get(protect, getMe);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router
  .route("/:id")
  .put(protect, authorize("SuperAdmin"), updateFrontdesk)
  .delete(protect, authorize("SuperAdmin"), deleteFrontdesk);

module.exports = router;

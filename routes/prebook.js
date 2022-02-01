const express = require("express");
const {
  verifyToken,
  getPrebooks,
  prebook,
  prebookMyGuest,
  getMyPrebooks,
  notifyHost,
  updatePrebook,
  deletePrebook,
} = require("../controllers/prebook");
const { protect, protects } = require("../middleware/auth");

const router = express.Router();

router.route("/").post(protect, prebook).get(protect, getPrebooks);
router.route("/verify").post(protect, verifyToken);
router
  .route("/staff")
  .post(protects, prebookMyGuest)
  .get(protects, getMyPrebooks);
router.route("/notify").post(protect, notifyHost);
router.route("/:id").put(updatePrebook).delete(deletePrebook);

module.exports = router;

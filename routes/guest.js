const express = require("express");
const {
  getVisitorsInfo,
  sendToHost,
  approveGuest,
  rejectGuest,
  checkOutGuest,
  checkinGuest,
} = require("../controllers/guest");

const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.route("/:id").get(protect, getVisitorsInfo);
router.route("/host").post(protect, sendToHost);
router.route("/checkin").post(protect, checkinGuest);
router.route("/checkout").post(checkOutGuest);
router.route("/approve").post(approveGuest);
router.route("/reject").post(rejectGuest);

module.exports = router;

const express = require("express");
const {
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/location");
const Location = require("../models/Location");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router
  .route("/")
  .post(protect, createLocation)
  .get(protect, advancedResults(Location), getLocation);
router
  .route("/:id")
  .put(protect, authorize("SuperAdmin"), updateLocation)
  .delete(protect, authorize("SuperAdmin"), deleteLocation);

module.exports = router;

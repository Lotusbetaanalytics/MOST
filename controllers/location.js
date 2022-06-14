const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Location = require("../models/Location");

// @desc    Create Frontdesk
// @route   POST/api/v1/frontdesk/
// @access   Private/Admin
exports.createLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.create(req.body);
  res.status(201).json({
    success: true,
    data: location,
  });
});

// @desc    Get ALl Location
// @route   POST/api/v1/location
// @access   Private/Admin
exports.getLocation = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Delete Location
// @route   POST/api/v1/location/
// @access   Private/Admin
exports.deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findByIdAndDelete(req.params.id);
  if (!location) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  res.status(200).json({
    success: true,
  });
});

// @desc    Update Location
// @route   POST/api/v1/location/
// @access   Private/Admin
exports.updateLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!location) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  res.status(200).json({
    success: true,
  });
});

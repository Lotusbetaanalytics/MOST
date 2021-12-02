const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ReturningVisitor = require("../models/ReturningVisitor");

// @desc    add Returning visitors
// @route   POST/api/v1/returning
// @access   Private
exports.addReturningVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await ReturningVisitor.create(req.body);
  res.status(201).json({
    success: true,
    data: visitor,
  });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getReturningVisitors = asyncHandler(async (req, res, next) => {
  const visitors = await ReturningVisitor.find();
  res
    .status(200)
    .json({ success: true, count: visitors.length, data: visitors });
});

// @desc    Get single visitors
// @route   GET/api/v1/visitors/:id
// @access   Public
exports.getReturningVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await ReturningVisitor.findById(req.params.id);
  if (!visitor) {
    return next(
      new ErrorResponse(`visitor not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: visitor });
});

// @desc    Update visitors
// @route   PUT/api/v1/visitors/:id
// @access   Private
exports.updateReturningVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await ReturningVisitor.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!visitor) {
    return next(
      new ErrorResponse(`visitor not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: visitor });
});

// @desc    Deletevisitors
// @route   DelETE/api/v1/visitors/:id
// @access   Private
exports.deleteReturningVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await ReturningVisitor.findByIdAndDelete(req.params.id);
  if (!visitor) {
    return next(
      new ErrorResponse(`visitor not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});

// @desc    Signout Visitor
// @route   POST/api/v1/visitors
// @access   Public
exports.signoutVisitor = asyncHandler(async (req, res, next) => {
  const visitors = await Visitor.find({ mobile: req.body.mobile });

  if (!visitors[0]) {
    return next(new ErrorResponse(`User not found`, 404));
  } else {
    res.status(200).json({
      success: true,
      data: {
        _id: visitors[0]._id,
        fullname: visitors[0].fullname,
        email: visitors[0].email,
        mobile: visitors[0].mobile,
        company: visitors[0].company,
        photo: visitors[0].photo,
      },
    });
  }
});

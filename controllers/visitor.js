const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Visitor = require("../models/visitor");
const ReturningVisitor = require("../models/ReturningVisitor");
const visitor = require("../models/visitor");
const Pusher = require("pusher");
const PushNotifications = require("@pusher/push-notifications-server");

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getVisitors = asyncHandler(async (req, res, next) => {
  const visitors = await Visitor.find();
  res
    .status(200)
    .json({ success: true, count: visitors.length, data: visitors });
});

// @desc    Get single visitors
// @route   GET/api/v1/visitors/:id
// @access   Public
exports.getVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    return next(
      new ErrorResponse(`visitor not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: visitor });
});

// @desc    Create visitors
// @route   POST/api/v1/visitors/
// @access   Private
exports.createVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await Visitor.create(req.body);

  if (visitor) {
    await ReturningVisitor.create({
      user: visitor._id,
      laptop: req.body.laptop,
      lsn: req.body.lsn,
      host: req.body.host,
      purpose: req.body.purpose,
      appointment: req.body.appointment,
      photo: req.body.photo,
      timeIn: req.body.timeIn,
      date: req.body.date,
      plusOne: req.body.plusOne,
    });
  }
  const pusher = new Pusher({
    appId: "1260379",
    key: "f82393c013f75193d268",
    secret: "bcc27c07bb60ec07e087",
    cluster: "mt1",
    useTLS: true,
  });

  pusher.trigger("my-channel", "my-event", {
    message: `Hello there! ${req.body.fullname} is here to see ${req.body.host}`,
  });
  res.status(201).json({
    success: true,
    data: visitor,
  });
});

// @desc    Update visitors
// @route   PUT/api/v1/visitors/:id
// @access   Private
exports.updateVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
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
exports.deleteVisitor = asyncHandler(async (req, res, next) => {
  const visitor = await Visitor.findByIdAndDelete(req.params.id);
  if (!visitor) {
    return next(
      new ErrorResponse(`visitor not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get Returning Visitor
// @route   POST/api/v1/visitors
// @access   Public
exports.getReturningVisitor = asyncHandler(async (req, res, next) => {
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

// @desc    Get Returning Visitor
// @route   POST/api/v1/visitors
// @access   Public
exports.checkVisitor = asyncHandler(async (req, res, next) => {
  const email = await Visitor.findOne({
    email: req.body.email,
  });

  const mobile = await Visitor.findOne({
    mobile: req.body.mobile,
  });
  if (email || mobile) {
    return next(new ErrorResponse(`User already exist,`, 401));
  } else {
    res.status(200).json({
      success: true,
    });
  }
});

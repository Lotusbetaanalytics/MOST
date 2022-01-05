const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Visitor = require("../models/visitor");
const ReturningVisitor = require("../models/ReturningVisitor");
const visitor = require("../models/visitor");
const Frontdesk = require("../models/Frontdesk");
const PreBooked = require("../models/PreBooked");
const Employee = require("../models/Employee");

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getVisitors = asyncHandler(async (req, res, next) => {
  const visitors = await Visitor.find();
  res
    .status(200)
    .json({ success: true, count: visitors.length, data: visitors });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const visitorsToday = await ReturningVisitor.find({ date: req.body.date });
  const admin = await Frontdesk.find();
  const staff = await Employee.find();
  const book = await PreBooked.find();
  const pending = await ReturningVisitor.find({
    date: req.body.date,
    status: "Pending",
  }).populate({ path: "user", select: "fullname company email mobile" });

  const awaiting = await ReturningVisitor.find({
    date: req.body.date,
    status: "Awaiting Host",
  }).populate({ path: "user", select: "fullname company email mobile" });

  const approved = await ReturningVisitor.find({
    date: req.body.date,
    status: "Approved",
  }).populate({ path: "user", select: "fullname company email mobile" });

  const rejected = await ReturningVisitor.find({
    date: req.body.date,
    status: "Rejected",
  }).populate({ path: "user", select: "fullname company email mobile" });

  const vin = await ReturningVisitor.find({
    date: req.body.date,
    status: "CheckedIn",
  }).populate({
    path: "user",
    select: "fullname company email mobile",
  });
  const out = await ReturningVisitor.find({
    date: req.body.date,
    status: "CheckedOut",
  }).populate({
    path: "user",
    select: "fullname company email mobile",
  });

  const all = await ReturningVisitor.find({});
  const allLogs = await ReturningVisitor.find({}).populate({
    path: "user",
    select: "fullname company email mobile",
  });
  const today = await ReturningVisitor.find({
    date: req.body.date,
  }).populate({ path: "user", select: "fullname company email mobile" });

  res.status(200).json({
    success: true,
    vtoday: visitorsToday.length,
    checkedIn: vin.length,
    checkedOut: out.length,
    all: all.length,
    pending: pending.length,
    newGuest: pending,
    awaiting,
    today,
    allLogs,
    approved,
    rejected,
    vin,
    out,
    admin: admin.length || 0,
    book: book.length || 0,
    staff: staff.length || 0,
    allStaff: staff,
    allAdmin: admin,
  });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.deleteStaff = asyncHandler(async (req, res, next) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.deleteFrontdesk = asyncHandler(async (req, res, next) => {
  await Frontdesk.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getStaff = asyncHandler(async (req, res, next) => {
  const staff = await Employee.findById(req.params.id);
  res.status(200).json({ success: true, data: staff });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getAdmin = asyncHandler(async (req, res, next) => {
  const staff = await Frontdesk.findById(req.params.id);
  res.status(200).json({ success: true, data: staff });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.updateStaff = asyncHandler(async (req, res, next) => {
  const staff = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: staff });
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.updateAdmin = asyncHandler(async (req, res, next) => {
  const staff = await Frontdesk.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: staff });
});

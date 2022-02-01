const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Visitor = require("../models/visitor");
const ReturningVisitor = require("../models/ReturningVisitor");
const Frontdesk = require("../models/Frontdesk");
const PreBooked = require("../models/PreBooked");
const Employee = require("../models/Employee");

// @desc    Get Logs
// @route   GET/api/v1/log
// @access   Private/Admin
exports.getLogs = asyncHandler(async (req, res, next) => {
  const department = await Employee.find();
  const staff = await Frontdesk.find();
  const unique = await Visitor.find();
  const all = await ReturningVisitor.find()
    .populate({
      path: "user",
      select: "title fullname email mobile company",
    })
    .populate({ path: "host", select: "name" })
    .populate({ path: "staff", select: "firstname lastname" });
  const prebooked = await PreBooked.find().populate({
    path: "host",
    select: "name",
  });
  res.status(200).json({
    department,
    staff,
    unique,
    all,
    prebooked,
  });
});

// @desc    Get Logs
// @route   GET/api/v1/log
// @access   Private/Admin
exports.getStaffLogs = asyncHandler(async (req, res, next) => {
  const staffUnique = await Visitor.find({ host: req.staff.id });
  const staffAll = await ReturningVisitor.find({ host: req.staff.id })
    .populate({
      path: "user",
      select: "title fullname email mobile company",
    })
    .populate({ path: "host", select: "name" });
  const staffPrebooked = await PreBooked.find({ host: req.staff.id }).populate({
    path: "host",
    select: "name",
  });
  res.status(200).json({
    staffUnique,
    staffAll,
    staffPrebooked,
  });
});

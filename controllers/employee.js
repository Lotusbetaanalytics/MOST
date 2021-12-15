const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Employee = require("../models/Employee");
const ReturningVisitor = require("../models/ReturningVisitor");
const visitor = require("../models/visitor");
const PreBooked = require("../models/PreBooked");

// @desc    Create Admin/SuperAdmin
// @route   POST/api/v1/auth/admin/register
// @access   Private/Admin
exports.createEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.create(req.body);

  res.status(201).json({
    success: true,
    data: employee,
  });
});

// @desc    Get Admin/SuperAdmin
// @route   POST/api/v1/auth/admin/register
// @access   Private/Admin
exports.getEmployee = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});



// @desc    Login User
// @route   POST/api/v1/auth/admin/login
// @access   Public
exports.staffLogin = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  //validate email & password
  if (!id) {
    return next(new ErrorResponse("Please Provide a token", 400));
  }
  //check for user
  const staff = await Employee.findById(id)

  if (!staff) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }
  sendTokenResponse(staff, 200, res);
});


//Get token from model, create cookie and send response
const sendTokenResponse = (staff, statusCode, res) => {
  //create token
  const token = staff.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};


// @desc    Get current logged in user
// @route   POST/api/v1/auth/me
// @access   Private

exports.getStaffProfile = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.staff.id);
 
  res.status(200).json({
    success: true,
    data: employee,
  });
});


// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getLogs = asyncHandler(async (req, res, next) => {
  const visitorsToday = await ReturningVisitor.find({ date: req.body.date, host:req.staff.id });
  const pending = await ReturningVisitor.find({
    date: req.body.date,
    status: "Pending",host:req.staff.id
  }).populate({ path: "user", select: "fullname company email mobile" });

  const awaiting = await ReturningVisitor.find({
    date: req.body.date,
    status: "Awaiting Host",host:req.staff.id
  }).populate({ path: "user", select: "fullname company email mobile" });

  const approved = await ReturningVisitor.find({
    date: req.body.date,
    status: "Approved",host:req.staff.id
  }).populate({ path: "user", select: "fullname company email mobile" });

  const rejected = await ReturningVisitor.find({
    date: req.body.date,
    status: "Rejected",host:req.staff.id
  }).populate({ path: "user", select: "fullname company email mobile" });



  const all = await ReturningVisitor.find({host:req.staff.id});
  const allLogs = await ReturningVisitor.find({host:req.staff.id}).populate({
    path: "user",
    select: "fullname company email mobile",
  });
  const today = await ReturningVisitor.find({
    date: req.body.date,host:req.staff.id
  }).populate({ path: "user", select: "fullname company email mobile" });
  
  const booked = await PreBooked.find({host:req.staff.id});

  res.status(200).json({
    success: true,
    vtoday: visitorsToday.length || 0,
    all: all.length || 0,
    pending: pending.length || 0,
    newGuest: pending,
    awaiting,
    today,
    allLogs,
    approved,
    rejected,
   booked,
   prebook:booked.length || 0
  });
});
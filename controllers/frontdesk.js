const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Frontdesk = require("../models/Frontdesk");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    Create Frontdesk
// @route   POST/api/v1/frontdesk/
// @access   Private/Admin
exports.createFrontdesk = asyncHandler(async (req, res, next) => {
  const frontdesk = await Frontdesk.create(req.body);
  res.status(201).json({
    success: true,
    data: frontdesk,
  });
});

// @desc    Get ALl Frontdesk
// @route   POST/api/v1/frontdesk
// @access   Private/Admin
exports.getFrontdesk = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Login User
// @route   POST/api/v1/frontdesk/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please Provide an email and password", 400));
  }
  //check for user
  const frontdesk = await Frontdesk.findOne({ email: email }).select(
    "+password"
  );

  if (!frontdesk) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //check if password match
  const isMatch = await frontdesk.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(frontdesk, 200, res);
});

// @desc    Log user out / clear cookie
// @route  GET /api/v1/auth/logout
// @access   Private

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current logged in user
// @route   POST/api/v1/auth/me
// @access   Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const frontdesk = await Frontdesk.findById(req.frontdesk.id);
  res.status(200).json({
    success: true,
    data: frontdesk,
  });
});

// @desc    Reset Password
// @route   PUT/api/v1/frontdesk/:resettoken
// @access   Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.body.id)
    .digest("hex");
  const user = await Frontdesk.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  // set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot Password
// @route   POST/api/v1/frontdesk/forgotpassword
// @access   Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await Frontdesk.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }
  //Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;

  const salutation = `Hello There!`;
  const content = ` You are receiving this email because you (or someone else) has requested
  the reset of a password, Click on the link below to reset your password 
  <br />
  <br />
  <a href="${resetUrl}" style="padding:1rem;color:white;background:green;border-radius:20px;">Click Here</a>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      salutation,
      content,
    });
    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (err) {
    console.log(err);
    user.getResetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

//Get token from model, create cookie and send response
const sendTokenResponse = (frontdesk, statusCode, res) => {
  //create token
  const token = frontdesk.getSignedJwtToken();

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

// @desc    Delete Frontdesk
// @route   POST/api/v1/frontdesk/
// @access   Private/Admin
exports.deleteFrontdesk = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.frontdesk.id) {
    return next(new ErrorResponse("Account cannot be deleted", 400));
  }
  const staff = await Frontdesk.findByIdAndDelete(req.params.id);
  if (!staff) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  res.status(200).json({
    success: true,
  });
});

// @desc    Update Frontdesk
// @route   POST/api/v1/frontdesk/
// @access   Private/Admin
exports.updateFrontdesk = asyncHandler(async (req, res, next) => {
  const staff = await Frontdesk.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!staff) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  res.status(200).json({
    success: true,
  });
});

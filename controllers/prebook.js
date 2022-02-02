const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const PreBooked = require("../models/PreBooked");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");
const Employee = require("../models/Employee");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// @desc    Verify Token
// @route   POST/api/v1/prebook/verify
// @access   Private/Admin
exports.verifyToken = asyncHandler(async (req, res, next) => {
  const book = await PreBooked.findOne({ token: req.body.token }).populate({
    path: "host",
    select: "name",
  });
  if (!book) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  if (book.active === false) {
    return next(new ErrorResponse("Token has been used", 400));
  }
  res.status(200).json({ success: true, data: book });
});

// @desc    PrebookGuest
// @route   POST/api/v1/prebook
// @access   Private/Admin
exports.prebook = asyncHandler(async (req, res, next) => {
  const code = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
    digits: true,
  });
  const host = await Employee.findById(req.body.host);
  req.body.token = code;

  const salutation = `Dear ${req.body.fullname},`;
  const content = ` You have been prebooked by ${host.name} on ${req.body.date}.
  Here's is your token 
  <h1>${req.body.token}</h1>`;
  const book = await PreBooked.create(req.body);
  res.status(201).json({ success: true, data: book });
  try {
    await sendEmail({
      email: req.body.email ? req.body.email : host.email,
      subject: "Prebook Guest",
      salutation,
      content,
      cc: host.email,
    });
    client.messages
      .create({
        body: `Dear ${req.body.fullname}, You have been prebooked by ${host.name} on ${req.body.date}. Your Access Token is: ${req.body.token}`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${req.body.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    const book = await PreBooked.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Get ALl Prebook
// @route   GET/api/v1/prebook/
// @access   Private/Admin
exports.getPrebooks = asyncHandler(async (req, res, next) => {
  const book = await PreBooked.find().populate({
    path: "host",
    select: "name",
  });
  if (!book) {
    return next(new ErrorResponse("Prebook Guest Unavailable", 400));
  }
  res.status(200).json({ success: true, data: book });
});

// @desc    PrebookGuest
// @route   POST/api/v1/prebook
// @access   Private/Admin
exports.prebookMyGuest = asyncHandler(async (req, res, next) => {
  const code = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
    digits: true,
  });
  const host = await Employee.findById(req.staff.id);
  req.body.token = code;
  req.body.host = req.staff.id;

  const salutation = `Dear ${req.body.fullname},`;
  const content = ` You have been prebooked by ${host.name} on ${req.body.date}.
    Here's is your token 
    <h1>${req.body.token}</h1>`;

  try {
    await sendEmail({
      email: req.body.email ? req.body.email : host.email,
      subject: "Prebook Guest",
      salutation,
      content,
      cc: host.email,
    });
    client.messages
      .create({
        body: `Dear ${req.body.fullname}, You have been prebooked by ${host.name} on ${req.body.date}. Your Access Token is: ${req.body.token}`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${req.body.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    const book = await PreBooked.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Get ALl Prebook
// @route   GET/api/v1/prebook/
// @access   Private/Admin
exports.getMyPrebooks = asyncHandler(async (req, res, next) => {
  const book = await PreBooked.find({ host: req.staff.id }).populate({
    path: "host",
    select: "name",
  });
  if (!book) {
    return next(new ErrorResponse("Prebook Guest Unavailable", 400));
  }
  res.status(200).json({ success: true, data: book });
});

// @desc    PrebookGuest
// @route   POST/api/v1/prebook
// @access   Private/Admin
exports.notifyHost = asyncHandler(async (req, res, next) => {
  const book = await PreBooked.findById(req.body.id);
  const host = await Employee.findById(book.host);
  const salutation = `Dear ${host.name},`;
  const content = ` Your prebooked guest ${book.fullname} has arrived`;
  const fields = {
    active: false,
  };
  try {
    await sendEmail({
      email: host.email,
      subject: "Prebook Guest",
      salutation,
      content,
    });
    client.messages
      .create({
        body: `Dear ${host.name}, Your prebooked guest ${book.fullname} has arrived`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${host.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    await PreBooked.findByIdAndUpdate(req.body.id, fields, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Delete Prebook
// @route   POST/api/v1/prebook/
// @access   Private/Admin
exports.deletePrebook = asyncHandler(async (req, res, next) => {
  const staff = await PreBooked.findByIdAndDelete(req.params.id);
  if (!staff) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  res.status(200).json({
    success: true,
  });
});

// @desc    Update Prebook
// @route   POST/api/v1/prebook/
// @access   Private/Admin
exports.updatePrebook = asyncHandler(async (req, res, next) => {
  const code = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
    digits: true,
  });
  const host = await Employee.findById(req.body.host);
  req.body.token = code;
  const salutation = `Dear ${req.body.fullname},`;
  const content = ` You have been prebooked by ${host.name} on ${req.body.date}.
  Here's is your token 
  <h1>${req.body.token}</h1>`;

  try {
    await sendEmail({
      email: req.body.email ? req.body.email : host.email,
      subject: "Prebook Guest",
      salutation,
      content,
      cc: host.email,
    });
    client.messages
      .create({
        body: `Dear ${req.body.fullname}, You have been prebooked by ${host.name} on ${req.body.date}. Your Access Token is: ${req.body.token}`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${req.body.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    await PreBooked.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

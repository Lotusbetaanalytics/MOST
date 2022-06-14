const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Visitor = require("../models/visitor");
const ReturningVisitor = require("../models/ReturningVisitor");
const Pusher = require("pusher");
const PushNotifications = require("@pusher/push-notifications-server");
const Frontdesk = require("../models/Frontdesk");
const Employee = require("../models/Employee");
const sendEmail = require("../utils/sendEmail");
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getVisitors = asyncHandler(async (req, res, next) => {
  const visitors = await ReturningVisitor.find().populate({
    path: "user",
    select: "fullname company email mobile",
  });

  res.status(200).json({ success: true, data: visitors });
});

// @desc    Create visitors
// @route   POST/api/v1/visitors/
// @access   Private
exports.newVisitor = asyncHandler(async (req, res, next) => {
  req.body.location = req.frontdesk.location;
  const user = await Visitor.findById(req.body.user);
  const host = await Employee.findById(req.body.host);
  const approve = `${req.protocol}://${req.get("host")}/staff/`;
  const fields = {
    title: req.body.title,
    company: req.body.company,
    role: req.body.role,
    mobile: req.body.mobile,
    email: req.body.email,
  };

  const salutation = `Dear ${host.name}`;
  const content = `${req.body.fullname} from ${req.body.company} is here to see you, click on the link below to accept or reject
    <br /><br /><img src="${req.body.photo}" alt="${req.body.name}" style="width:200px;height:200px;border-radius:50%" /><br /><br /><a href="${approve}" style="padding:1rem 2rem;color:white;background:green;border-radius:20px;text-decoration:none">Click Here</a>`;

  try {
    await sendEmail({
      email: host.email,
      subject: "New Guest",
      salutation,
      content,
    });
    client.messages
      .create({
        body: `Hi ${host.name}!,  ${user.fullname} from ${user.company}, is here to see you, Check your email for more information`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${host.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    client.messages
      .create({
        body: `Hi ${host.name}!,  ${user.fullname} from ${user.company}, is here to see you, Check your email for more information`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${host.phone}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    await Visitor.findByIdAndUpdate(req.body.user, fields, {
      new: true,
      runValidators: true,
    });
    await ReturningVisitor.create({
      user: req.body.user,
      role: req.body.role,
      group: req.body.group,
      count: req.body.count,
      host: req.body.host,
      purpose: req.body.purpose,
      appointment: req.body.appointment,
      photo: req.body.photo,
      timeIn: req.body.timeIn,
      date: req.body.date,
      status: "Awaiting Host",
      staff: req.frontdesk.id,
      location: req.frontdesk.location,
    });
    res.status(201).json({ success: true, data: "Email Sent" });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Approve
// @route   PUT/api/v1/visitors/approve/:id
// @access   Public
exports.approveVisitor = asyncHandler(async (req, res, next) => {
  const fields = {
    status: "Approved",
  };
  const visitors = await ReturningVisitor.findByIdAndUpdate(
    req.params.id,
    fields,
    {
      new: true,
      runValidators: true,
    }
  );
  const serviceDesk = await Frontdesk.findById(visitors.staff);
  if (!visitors) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  // client.messages
  //   .create({
  //     body: `Hi ${serviceDesk.firstname}!,  ${req.body.name} has been approved by ${req.staff.name}`,
  //     messagingServiceSid: `${process.env.TWILIO_SID}`,
  //     from: "VMS",
  //     to: `+234${serviceDesk.mobile}`,
  //   })
  //   .then((message) => console.log(message.sid))
  //   .done();

  req.io.emit(
    "aprroved",
    `Hi ${serviceDesk.firstname}!,  ${req.body.name} has been approved by ${req.staff.name}`
  );
  res.status(200).json({ success: true });
});

// @desc    Reject
// @route   PUT/api/v1/visitors/reject/:id
// @access   Public
exports.rejectVisitor = asyncHandler(async (req, res, next) => {
  let date = new Date().toLocaleString();
  const fields = {
    status: "Rejected",
    timeOut: date,
  };
  const visitors = await ReturningVisitor.findByIdAndUpdate(
    req.params.id,
    fields,
    {
      new: true,
      runValidators: true,
    }
  );
  const serviceDesk = await Frontdesk.findById(visitors.staff);
  if (!visitors) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  // client.messages
  //   .create({
  //     body: `Hi ${serviceDesk.firstname}!,  ${req.body.name} has been rejected by ${req.staff.name}`,
  //     messagingServiceSid: `${process.env.TWILIO_SID}`,
  //     from: "VMS",
  //     to: `+234${serviceDesk.mobile}`,
  //   })
  //   .then((message) => console.log(message.sid))
  //   .done();
  req.io.emit(
    "aprroved",
    `Hi ${serviceDesk.firstname}!,  ${req.body.name} has been rejected by ${req.staff.name}`
  );
  res.status(200).json({ success: true });
});

// @desc    Checkin
// @route   PUT/api/v1/visitors/checkin/:id
// @access   Private
exports.checkinVisitor = asyncHandler(async (req, res, next) => {
  const fields = {
    tag: req.body.tag,
    status: "CheckedIn",
  };
  const visitors = await ReturningVisitor.findByIdAndUpdate(
    req.params.id,
    fields,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!visitors) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  res.status(200).json({ success: true });
});

// @desc    Checkin
// @route   PUT/api/v1/visitors/checkin/:id
// @access   Private
exports.checkoutVisitor = asyncHandler(async (req, res, next) => {
  let date = new Date().toLocaleString();
  const fields = {
    timeOut: date,
    status: "CheckedOut",
  };
  const visitors = await ReturningVisitor.findByIdAndUpdate(
    req.params.id,
    fields,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!visitors) {
    return next(new ErrorResponse("An Error Occured, Try Again", 400));
  }
  res.status(200).json({ success: true });
});

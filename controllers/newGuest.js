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

// @desc    Create visitors
// @route   POST/api/v1/guest/
// @access   Private
exports.newVisitor = asyncHandler(async (req, res, next) => {
  const host = await Employee.findById(req.body.host);
  const approve = `${req.protocol}://${req.get("host")}/staff/`;

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
        body: `Hi ${host.name}!,  ${req.body.fullname} from ${req.body.company}, is here to see you, Check your email for more information`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${host.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    client.messages
      .create({
        body: `Hi ${host.name}!,  ${req.body.fullname} from ${req.body.company}, is here to see you, Check your email for more information`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${host.phone}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    const visitor = await Visitor.create(req.body);
    if (visitor) {
      await ReturningVisitor.create({
        user: visitor._id,
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
      });
    }
    res.status(201).json({ success: true, data: "Email Sent" });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Get all visitors
// @route   GET/api/v1/visitors
// @access   Public
exports.getVisitors = asyncHandler(async (req, res, next) => {
  const visitors = await Visitor.find();
  res.status(200).json({ success: true, data: visitors });
});

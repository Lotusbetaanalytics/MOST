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
// @route   POST/api/v1/visitors/
// @access   Private
exports.newVisitor = asyncHandler(async (req, res, next) => {
  const host = await Employee.findById(req.body.host);
  const approve = `${req.protocol}://${req.get("host")}/staff/`;

  const html = `<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
<tbody>
   <tr>
       <td align="center">
           <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0">
               <tbody>
                   <tr>
                       <td align="center" valign="top" bgcolor="#640ad2"
                           style="background:linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),url(https://vmslag-test.azurewebsites.net/static/media/logo.4bf34e25.png);background-size:cover; background-position:top;height:230">
                           <table class="col-600" width="600" height="200" border="0" align="center"
                               cellpadding="0" cellspacing="0">
                               <tbody>
                                   <tr>
                                       <td align="center" style="line-height: 0px;">
                                           <img style="display:block; line-height:0px; font-size:0px; border:0px;"
                                               src="https://vmslag-test.azurewebsites.net/static/media/logo.4bf34e25.png"
                                               width="70" height="70" alt="logo">
                                       </td>
                                   </tr>
                                   <tr>
                                       <td align="center"
                                           style="font-family: 'Raleway', sans-serif; font-size:20px; color:#000;font-weight: bold;">
                                           Lagos State Ministry of Science & Technology
                                       </td>
                                   </tr>
                               </tbody>
                           </table>
                       </td>
                   </tr>
               </tbody>
           </table>
       </td>
   </tr>
   <tr>
       <td align="center">
           <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0"
               style="margin-left:20px; margin-right:20px; border-left: 1px solid #dbd9d9; border-right: 1px solid #dbd9d9;">
               <tbody>
                   <tr>
                       <td height="35"></td>
                   </tr>

                   <tr>
                       <td align="center"
                           style="font-family: 'Raleway', sans-serif; font-size:22px; font-weight: bold; color:#2a3a4b;">
                           Dear ${host.name}
                           
                       </td>
                   </tr>

                   <tr>
                       <td height="10"></td>
                   </tr>


                   <tr>
                       <td align="center"
                           style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                           ${req.body.fullname} from ${req.body.company} is here to see you, click on the link below to accept or reject
                           <br />
                           <br />
                          <img src="${req.body.photo}" alt="${req.body.name}" style="width:200px;height:200px;border-radius:50%" />
                           <br />
                           <br />
                           <a href="${approve}" style="padding:1rem 2rem;color:white;background:green;border-radius:20px;text-decoration:none">Click Here</a>
                       </td>
                   </tr>

               </tbody>
           </table>
       </td>
   </tr>
</tbody>
</table>`;

  try {
    await sendEmail({
      email: host.email,
      subject: "New Guest",
      html,
    });

    client.messages
      .create({
        body: `Hi ${host.fullname}!,  ${user.fullname} from ${user.company}, is here to see you, Check your email for more information`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "VMS",
        to: `+234${host.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    client.messages
      .create({
        body: `Hi ${host.fullname}!,  ${user.fullname} from ${user.company}, is here to see you, Check your email for more information`,
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
      });
    }
    res.status(201).json({ success: true, data: "Email Sent" });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// const pusher = new Pusher({
//     appId: "1260379",
//     key: "f82393c013f75193d268",
//     secret: "bcc27c07bb60ec07e087",
//     cluster: "mt1",
//     useTLS: true,
//   });

//   pusher.trigger("my-channel", "my-event", {
//     message: `Hello there! ${req.body.fullname} is here to see ${req.body.host}`,
//   });

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

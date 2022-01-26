const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ReturningVisitor = require("../models/ReturningVisitor");
const Visitor = require("../models/visitor");
const Frontdesk = require("../models/Frontdesk");
const Employee = require("../models/Employee");
const sendEmail = require("../utils/sendEmail");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// @desc    Get single visitor info
// @route   GET/api/v1/
// @access   Private
exports.getVisitorsInfo = asyncHandler(async (req, res, next) => {
  const visitors = await ReturningVisitor.findOne({
    _id: req.params.id,
  })
    .populate({
      path: "user",
      select: "fullname company email mobile",
    })
    .populate({
      path: "host",
      select: "name",
    });
  res.status(200).json({ success: true, data: visitors });
});

// @desc    Send Request to Host
// @route   POST/api/v1/
// @access   Private
exports.sendToHost = asyncHandler(async (req, res, next) => {
  //Create reset url

  const host = await Employee.findById(req.body.host);
  const approve = `${req.protocol}://${req.get("host")}/staff/${host._id}`;

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
                            Dear ${host.fullname}
                            
                        </td>
                    </tr>

                    <tr>
                        <td height="10"></td>
                    </tr>


                    <tr>
                        <td align="center"
                            style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                            ${req.body.name} from ${req.body.company} is here to see you, click on the link below to accept or reject
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

  // const msg = {
  //   to: host.email, // Change to your recipient
  //   from: 'vmanagement@lagosstate.gov.ng', // Change to your verified sender
  //   subject: "New Guest",
  //   html: html,
  // }
  // sgMail
  //   .send(msg)
  //   .then(() => {
  //     console.log('Email sent')
  //       res.status(200).json({ success: true, data: "Email Sent" });
  //   })
  //   .catch((error) => {
  //     console.error(error)
  //     return next(new ErrorResponse("Email could not be sent", 500));
  //   })

  // req.body.status = "Awaiting Host";
  req.body.status = "Pending";
  try {
    await sendEmail({
      email: host.email,
      subject: "New Guest",
      html,
    });
    await ReturningVisitor.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
      runValidators: true,
    });

    client.messages
      .create({
        body: `Hi ${host.fullname}!,  ${req.body.name} is here to see you, Check your email for more information`,
        messagingServiceSid: `${process.env.TWILIO_SID}`,
        from: "+19472085695",
        to: `+234${host.mobile}`,
      })
      .then((message) => console.log(message.sid))
      .done();
    res.status(200).json({ success: true, data: "Email Sent" });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    approve Guest
// @route   POST/api/v1/
// @access   Private
exports.approveGuest = asyncHandler(async (req, res, next) => {
  req.body.status = "Approved";
  await ReturningVisitor.findByIdAndUpdate(req.body.id, req.body, {
    new: true,
    runValidators: true,
  });
  const guest = await Frontdesk.find();

  client.messages
    .create({
      body: `Hi Frontdesk!,  ${req.body.name} has been approved`,
      messagingServiceSid: `${process.env.TWILIO_SID}`,
      from: "+19472085695",
      to: `+234${guest[0].mobile}`,
    })
    .then((message) => console.log(message.sid))
    .done();

  res.status(200).json({ success: true, data: "Guest has been Approved" });
  // io.on("connection", (socket) => {
  //   socket.on("message", () => {
  //     io.emit("message", "Guest has been Approved");
  //   });
  // });
});

// @desc    reject Guest
// @route   POST/api/v1/
// @access   Private
exports.rejectGuest = asyncHandler(async (req, res, next) => {
  req.body.status = "Rejected";
  await ReturningVisitor.findByIdAndUpdate(req.body.id, req.body, {
    new: true,
    runValidators: true,
  });
  const guest = await Frontdesk.find();

  client.messages
    .create({
      body: `Hi Frontdesk!,  ${req.body.name} has been rejected`,
      messagingServiceSid: `${process.env.TWILIO_SID}`,
      from: "+19472085695",
      to: `+234${guest[0].mobile}`,
    })
    .then((message) => console.log(message.sid))
    .done();
  res.status(200).json({ success: true, data: "Guest has been Rejected" });
});

// @desc    reject Guest
// @route   POST/api/v1/
// @access   Private
exports.checkinGuest = asyncHandler(async (req, res, next) => {
  req.body.status = "CheckedIn";
  await ReturningVisitor.findByIdAndUpdate(req.body.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: "Guest has Checkedin" });
});

// @desc    reject Guest
// @route   POST/api/v1/
// @access   Private
exports.checkOutGuest = asyncHandler(async (req, res, next) => {
  req.body.status = "CheckedOut";
  req.body.timeOut = new Date().toLocaleString();

  const me = await ReturningVisitor.findOne({ tag: req.body.tag })
    .sort({ _id: -1 })
    .limit(1);

  await ReturningVisitor.findByIdAndUpdate(me._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: "Guest has Checked Out" });
});

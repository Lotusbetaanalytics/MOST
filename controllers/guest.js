const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ReturningVisitor = require("../models/ReturningVisitor");
const Visitor = require("../models/visitor");
const Employee = require("../models/Employee");
const sendEmail = require("../utils/sendEmail");

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
      select: "firstname lastname",
    });
  res.status(200).json({ success: true, data: visitors });
});

// @desc    Send Request to Host
// @route   POST/api/v1/
// @access   Private
exports.sendToHost = asyncHandler(async (req, res, next) => {
  //Create reset url
  const approve = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/frontdesk/guest/approve/${req.body.id}`;
  const reject = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/frontdesk/guest/reject/${req.body.id}`;

  const host = await Employee.findById(req.body.host);

  const html = `<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
<tbody>
    <tr>
        <td align="center">
            <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                <tbody>
                    <tr>
                        <td align="center" valign="top" bgcolor="#640ad2"
                            style="background:linear-gradient(0deg, rgba(100, 10, 210, 0.8), rgba(100, 10, 210, 0.8)),url(https://lbanstaffportal.herokuapp.com/static/media/tech.45a93050.jpg);background-size:cover; background-position:top;height:230">
                            <table class="col-600" width="600" height="200" border="0" align="center"
                                cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                        <td align="center" style="line-height: 0px;">
                                            <img style="display:block; line-height:0px; font-size:0px; border:0px;"
                                                src="https://lbanstaffportal.herokuapp.com/static/media/logo.49e95c77.png"
                                                width="70" height="70" alt="logo">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center"
                                            style="font-family: 'Raleway', sans-serif; font-size:37px; color:#ffffff;font-weight: bold;">
                                            Lotus Beta Analytics
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center"
                                            style="font-family: 'Lato', sans-serif; font-size:15px; color:#ffffff;font-weight: 300;">
                                            Our goal as an organization is to provide our customers with the best
                                            value
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
                            Dear ${host.firstname}
                            
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
                            <a href="${approve}" style="padding:1rem 2rem;color:white;background:green;border-radius:20px;text-decoration:none">Approve</a>
                            <a href="${reject}" style="padding:1rem 2rem;color:white;background:crimson;border-radius:20px;text-decoration:none">Reject</a>
                        </td>
                    </tr>

                </tbody>
            </table>
        </td>
    </tr>
</tbody>
</table>`;
  req.body.status = "Awaiting Host";
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
  await ReturningVisitor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
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
  await ReturningVisitor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
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
  const find = await Visitor.findOne({
    mobile: req.body.mobile,
  })
    .sort({ _id: -1 })
    .limit(1);

  const me = await ReturningVisitor.findOne({ user: find._id })
    .sort({ _id: -1 })
    .limit(1);

  await ReturningVisitor.findByIdAndUpdate(me._id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: "Guest has Checked Out" });
});

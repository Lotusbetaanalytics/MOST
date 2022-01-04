const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const PreBooked = require("../models/PreBooked");
const otpGenerator = require("otp-generator");
const sendEmail = require("../utils/sendEmail");
const Employee = require("../models/Employee");

// @desc    Create Admin/SuperAdmin
// @route   POST/api/v1/auth/admin/register
// @access   Private/Admin
exports.prebook = asyncHandler(async (req, res, next) => {
  const code = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    alphabets: false,
    digits: true,
  });
  const host = await Employee.findOne({ email: req.body.host });
  req.body.host = host._id;
  req.body.code = code;
  req.body.token = code;

  const html = `<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
  <tbody>
      <tr>
          <td align="center">
              <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                  <tbody>
                      <tr>
                          <td align="center" valign="top" bgcolor="#640ad2"
                              style="background:linear-gradient(0deg, rgba(100, 10, 210, 0.8), rgba(100, 10, 210, 0.8)),url(https://vmslag.azurewebsites.net/static/media/logo.4bf34e25.png);background-size:cover; background-position:top;height:230">
                              <table class="col-600" width="600" height="200" border="0" align="center"
                                  cellpadding="0" cellspacing="0">
                                  <tbody>
                                      <tr>
                                          <td align="center" style="line-height: 0px;">
                                              <img style="display:block; line-height:0px; font-size:0px; border:0px;"
                                                  src="https://vmslag.azurewebsites.net/static/media/logo.4bf34e25.png"
                                                  width="70" height="70" alt="logo">
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center"
                                              style="font-family: 'Raleway', sans-serif; font-size:37px; color:#ffffff;font-weight: bold;">
                                           Lagos State Ministry of Science
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
                              Dear ${req.body.fullname},
                              
                          </td>
                      </tr>
  
                      <tr>
                          <td height="10"></td>
                      </tr>
  
  
                      <tr>
                          <td align="center"
                              style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                           You have been prebooked by ${host.fullname} on ${req.body.date}. time: ${req.body.timeIn}
                             Here's is your token 
                             <h1>${req.body.code}</h1>
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
      email: req.body.email,
      subject: "Prebooked Guest",
      cc: host.email,
      html,
    });
    const book = await PreBooked.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Get Admin/SuperAdmin
// @route   POST/api/v1/auth/admin/register
// @access   Private/Admin
exports.prebookSignin = asyncHandler(async (req, res, next) => {
  const book = await PreBooked.findOne({ token: req.body.token });
  if (!book) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  res.status(200).json({ success: true, data: book });
});

// @desc    Create Admin/SuperAdmin
// @route   POST/api/v1/auth/admin/register
// @access   Private/Admin
exports.notifyHost = asyncHandler(async (req, res, next) => {
  const guest = await PreBooked.findById(req.body.id);
  const host = await Employee.findById(guest.host);

  const html = `<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
    <tbody>
        <tr>
            <td align="center">
                <table class="col-600" width="600" border="0" align="center" cellpadding="0" cellspacing="0">
                    <tbody>
                        <tr>
                            <td align="center" valign="top" bgcolor="#640ad2"
                                style="background:linear-gradient(0deg, rgba(100, 10, 210, 0.8), rgba(100, 10, 210, 0.8)),url(https://vmslag.azurewebsites.net/static/media/logo.4bf34e25.png);background-size:cover; background-position:top;height:230">
                                <table class="col-600" width="600" height="200" border="0" align="center"
                                    cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="line-height: 0px;">
                                                <img style="display:block; line-height:0px; font-size:0px; border:0px;"
                                                    src="https://vmslag.azurewebsites.net/static/media/logo.4bf34e25.png"
                                                    width="70" height="70" alt="logo">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center"
                                                style="font-family: 'Raleway', sans-serif; font-size:37px; color:#ffffff;font-weight: bold;">
                                             Lagos State Ministry of Science
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
                                Dear ${host.fullname},
                                
                            </td>
                        </tr>
    
                        <tr>
                            <td height="10"></td>
                        </tr>
    
    
                        <tr>
                            <td align="center"
                                style="font-family: 'Lato', sans-serif; font-size:14px; color:#757575; line-height:24px; font-weight: 300;">
                            Your Guest ${guest.fullname} has arrived
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
      email: guest.email,
      subject: "Prebooked Guest",
      cc: host.email,
      html,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const EmployeeSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please add name"],
  },
  mobile: {
    type: String,
    maxlength: [20, "Phone Number cannot be more than 20 characters"],
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  designation: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
//Sign JWT and return
EmployeeSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("Employee", EmployeeSchema);

const mongoose = require("mongoose");

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

module.exports = mongoose.model("Employee", EmployeeSchema);

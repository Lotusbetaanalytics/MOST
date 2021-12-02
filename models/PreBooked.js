const mongoose = require("mongoose");

const PreBookedSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please add name"],
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
  },
  host: {
    type: String,
    required: [true, "Please add host"],
  },
  date: { type: String },
  timeIn: { type: String },
  timeOut: { type: String },
  token: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PreBooked", PreBookedSchema);

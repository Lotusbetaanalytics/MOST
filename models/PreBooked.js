const mongoose = require("mongoose");

const PreBookedSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please add name"],
  },
  mobile: {
    type: String,
  },
  company: {
    type: String,
  },
  purpose: {
    type: String,
  },
  email: {
    type: String,
  },
  host: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Please add host"],
  },
  photo: {
    type: String,
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

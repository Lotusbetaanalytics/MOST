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
    ref: "Employee",
    required: [true, "Please add host"],
  },
  location: {
    type: mongoose.Schema.ObjectId,
    ref: "Location",
    required: [true, "Please add location"],
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
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
});

module.exports = mongoose.model("PreBooked", PreBookedSchema);

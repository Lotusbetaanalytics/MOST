const mongoose = require("mongoose");

const ReturningVisitorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "Visitor",
    required: true,
  },
  host: {
    type: mongoose.Schema.ObjectId,
    ref: "Employee",
    required: [true, "Please add host"],
  },
  purpose: {
    type: String,
    required: [true, "Please add purpose"],
  },
  appointment: {
    type: String,
    required: [true, "Please add appointment"],
  },
  role: {
    type: String,
  },
  group: {
    type: String,
  },
  count: {
    type: String,
    default: "1",
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  date: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "Approved",
      "CheckedIn",
      "CheckedOut",
      "Pending",
      "Rejected",
      "Awaiting Host",
    ],
    default: "Pending",
  },
  month: {
    type: String,
  },
  timeIn: {
    type: String,
  },
  timeOut: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tag: {
    type: String,
  },
  location: {
    type: mongoose.Schema.ObjectId,
    ref: "Location",
    required: [true, "Please add location"],
  },
  staff: {
    type: mongoose.Schema.ObjectId,
    ref: "Frontdesk",
  },
});

module.exports = mongoose.model("ReturningVisitor", ReturningVisitorSchema);

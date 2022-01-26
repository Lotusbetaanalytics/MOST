const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add title"],
  },
  fullname: {
    type: String,
    required: [true, "Please add fullname"],
  },
  company: {
    type: String,
    required: [true, "Please add company"],
  },
  mobile: {
    type: String,
    maxlength: [20, "Phone Number cannot be more than 20 characters"],
    unique: true,
  },
  email: {
    type: String,
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
  role: {
    type: String,
  },
  group: {
    type: String,
  },
  count: {
    type: String,
  },
  appointment: {
    type: String,
    required: [true, "Please add appointment"],
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Visitor", VisitorSchema);

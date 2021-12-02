const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please add name"],
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
    unique: true,
  },
  laptop: {
    type: String,
    required: [true, "Please add laptop"],
  },
  lsn: {
    type: String,
  },
  host: {
    type: String,
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

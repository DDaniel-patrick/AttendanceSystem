const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userOtp = new Schema({
  uniqueID: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  otp: {
    type: String,
    unique: true,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: Date,
  expiresAt: Date,
});

module.exports = mongoose.model("UserOtp", userOtp);

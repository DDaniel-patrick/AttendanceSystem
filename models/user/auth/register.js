const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userRegister = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  picture: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  picturePublicID: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("UserRegister", userRegister);

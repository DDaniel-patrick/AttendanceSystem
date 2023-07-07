const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const attendance = new Schema({
  name: {
    type: String,
    required: true,
  },
  adminId: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: "",
  },
  // completed: {
  //   type: Boolean,
  //   default: false,
  // },
  closed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Attendance", attendance);

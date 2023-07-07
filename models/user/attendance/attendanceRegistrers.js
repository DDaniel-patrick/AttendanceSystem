const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const attendanceRegistrers = new Schema({
  name: {
    type: String,
    required: true,
  },
  attendanceId: {
    type: String,
    required: true,
  },
  time: Date,
  present: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("AttendanceRegistrers", attendanceRegistrers);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const attendanceRegistrers = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength:[3,"Name too short"],
    maxlength:[30,"Name too long"],
  },
  attendanceId: {
    type: String,
    required: [true, "Id is required"],
    minlength:[24,"Id too short"],
    maxlength:[24,"Id too long"],
  },
  present: {
    type: Boolean,
    default: false,
  },
},{timestamps:true});

module.exports = mongoose.model("AttendanceRegistrers", attendanceRegistrers);

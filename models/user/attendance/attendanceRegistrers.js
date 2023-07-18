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
    default: true,
  },
  Reason: {
    type: String,
    minlength:[4,"Reason too short"],
    maxlength:[54,"Reason too long"],
    default:"none"
  },
},{timestamps:true});

module.exports = mongoose.model("AttendanceRegistrers", attendanceRegistrers);

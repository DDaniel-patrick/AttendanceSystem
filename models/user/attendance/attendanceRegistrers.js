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
    maxlength:[54,"Reason too long"],
    default:"no text was filled"
  },
  Gender: {
    type: String,
    required:true,
    enum:["Male","Female"]
  },
  adminID:{
    type: String,
    required: [true, "AdmId is required"],
    minlength:[24,"AdmId too short"],
    maxlength:[24,"AdmId too long"],
  }
},{timestamps:true});

module.exports = mongoose.model("AttendanceRegistrers", attendanceRegistrers);

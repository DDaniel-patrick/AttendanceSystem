const mongoose = require("mongoose");
const { Links } = require("../../../utils/random.utils");

const Schema = mongoose.Schema;

const LinkUser = new Schema({
  uniqueID: {
    type: String,
    unique: true,
    required: true,
  },
  link:{
    type:String,
    default:Links()
  },
  expireAt:{
    type: Date,
    default: Date.now,
    expires: "10m", 
  }
},{timestamps:true});

module.exports = mongoose.model("Link", LinkUser);

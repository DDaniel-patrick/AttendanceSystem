const express = require("express");
const app = express();

// dotenv
require("dotenv").config();

const PORT = process.env.PORT;

// body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// cloudinary
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

// morgan
app.use(require("morgan")("dev"));

// express session
app.use(
  require("express-session")({
    secret: process.env.secret,
    resave: true,
    saveUninitialized: true,
    cookie: { expires: 43800 },
  })
);

// express file upload
app.use(require("express-fileupload")({ useTempFiles: true }));

// mongoose
const mongoose = require('mongoose')
mongoose.connect()
const express = require("express");
const app = express();

// dotenv
require("dotenv").config();

const PORT = process.env.PORT||3000;

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
    cookie: { expires: 876000000 },
  })
);

// express file upload
app.use(require("express-fileupload")({ useTempFiles: true }));

// mongoose
const mongoose = require("mongoose");
mongoose.set('strictQuery',true)
mongoose.set('runValidators',true)
mongoose
  .connect(process.env.mongo_link, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((res) => {
    if (res) {
      console.log("Database Connected");
      app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
    } else {
      console.log("Database not connected");
    }
  }).catch(err=>{console.log(err)});

//   templating
app.set("view engine", "ejs");
app.use(express.static("public"));

// routes

// general
app.use("/", require("./routes/index"));

// admin
app.use("/login", require("./routes/auth/login")); // login route
app.use("/register", require("./routes/auth/register")); //register route
app.use("/home", require("./routes/Dashboard/home")); // home route
app.use("/profile", require("./routes/Dashboard/profile")); // profile route
app.use("/attendance", require("./routes/Dashboard/Attendance")); // Attendance route
app.get('/logout',(req,res)=>{req.session.destroy();res.redirect('/')})
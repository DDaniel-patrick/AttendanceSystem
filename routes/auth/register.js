const express = require("express");
const router = express.Router();

const registerMod = require("./../../models/user/auth/register");
const otpMod = require("./../../models/user/auth/otp");

const cloudinary = require("cloudinary");
const bcrypt = require("bcrypt");
const mailer = require("nodemailer");

const systemMail = mailer.createTransport({
  service: process.env.service,
  host: process.env.host,
  port: 465,
  auth: {
    user: process.env.email,
    pass: process.env.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.get("/", (req, res) => {
  res.render("auth/register", { msg: "" });
});

router.post("/", async (req, res) => {
  const sess = req.session;
  const fullName = req.body.name.trim();
  const phoneNumber = req.body.phone.trim();
  const dob = req.body.age.trim();
  const gender = req.body.gender.trim();
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const confirmPassword = req.body.confirmPassword.trim();
  try {
    if (
      fullName != null &&
      phoneNumber != null &&
      dob != null &&
      gender != null &&
      email != null &&
      password != null &&
      confirmPassword != null
    ) {
      if (fullName.length >= 7 && password.length >= 8) {
        const birth = dob;
        const yob = birth.slice(0, 4);
        const yobN = parseInt(yob, 10);
        const date = new Date();
        const realDate =
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDay();
        const realYear = realDate.slice(0, 4);
        const now = parseInt(realYear, 10);
        const age = now - yobN;
        if (age >= 18) {
          if (password === confirmPassword) {
            const verifyMail = await registerMod.findOne({ email: email });
            if (!verifyMail) {
              const profile = req.files.picture;
              if (
                profile.mimetype == "image/apng" ||
                profile.mimetype == "image/avif" ||
                profile.mimetype == "image/gif" ||
                profile.mimetype == "image/jpeg" ||
                profile.mimetype == "image/png" ||
                profile.mimetype == "image/svg+xml" ||
                profile.mimetype == "image/webp"
              ) {
                const upload = await cloudinary.v2.uploader.upload(
                  profile.tempFilePath,
                  {
                    resource_type: "image",
                    folder: process.env.profilePictureFolder,
                    use_filename: false,
                    unique_filename: true,
                  }
                );
                const user = new registerMod({
                  name: fullName,
                  phone: phoneNumber,
                  age: age,
                  gender: gender,
                  email: email,
                  picture: upload.secure_url,
                  password: bcrypt.hashSync(password, 10),
                  picturePublicID: upload.public_id,
                });
                const saveUser = await user.save();
                const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
                console.log(otp);
                // const duration = 1;
                // const expires = Date.now + 3600000 * +duration
                const expires = Date.now() + 1 * (60 * 60 * 1000);
                const OTP = new otpMod({
                  uniqueID: saveUser._id,
                  email: saveUser.email,
                  otp: bcrypt.hashSync(otp, 10),
                  createdAt: Date.now(),
                  expiresAt: expires,
                });
                await OTP.save();
                sess.email = req.body.email;
                sess.password = req.body.password;
                const mailOption = {
                  from: `${process.env.adminName} ${process.env.email}`,
                  to: req.body.email,
                  subject: `${fullName} OTP`,
                  html: `
                                                <html>
                                                <head>
                                                  <style>
                                                    body {
                                                      font-family: Arial, sans-serif;
                                                    }
                                                    
                                                    h1 {
                                                      text-align: center;
                                                    }
                                                    
                                                    h3 {
                                                      text-align: center;
                                                      margin-top: 30px;
                                                    }
                                                    
                                                    .otp-code {
                                                      font-size: 36px;
                                                      font-weight: bold;
                                                      text-align: center;
                                                      margin-top: 40px;
                                                      margin-bottom: 50px;
                                                    }
                                                  </style>
                                                </head>
                                                <body>
                                                  <h1>OTP Email</h1>
                                                  
                                                  <h3>Hello ${fullName},</h3>
                                                  
                                                  <p style="text-align: center;">Your One-Time Password (OTP) is:</p>
                                                  
                                                  <div class="otp-code">
                                                    ${otp}
                                                  </div>
                                                  
                                                  <p style="text-align: center;">Please use this OTP to complete your verification process. This Code expires in 1 hour.</p>
                                                  
                                                  <p style="text-align: center;">If you didn't request this OTP, please ignore this email.</p>
                                                  
                                                  <p style="text-align: center;">Regards,<br>RealTime Attendance Team</p>
                                                </body>
                                                </html>
                                            `,
                };
                await systemMail.sendMail(mailOption);
                res.redirect("/register/otp");
              } else {
                res.render("auth/register", {
                  msg: "Invalid Image File Type!",
                });
              }
            } else {
              res.render("auth/register", {
                msg: "User with this Email already exists!",
              });
            }
          } else {
            res.render("auth/register", {
              msg: "Password and Confirm Password has to be the same!",
            });
          }
        } else {
          res.render("auth/register", {
            msg: `You are not old enough to register. Try again in ${
              18 - age
            } year(s)!!!`,
          });
        }
      } else {
        res.render("auth/register", {
          msg: "Please fIll all Fields Correctly",
        });
      }
    } else {
      res.render("auth/register", { msg: "Please fill all the fields!" });
    }
  } catch (error) {
    console.log(error);
    res.render("auth/register", { msg: "An Error Occured!!!" });
  }
});

router.get("/otp", (req, res) => {
  const sess = req.session;
  console.log('first')
  console.log(sess)
  if (sess.email && sess.password) {
    res.render("auth/otp", { msg: "" });
  } else {
    res.redirect("/");
  }
});

router.post("/otp", async (req, res, next) => {
  const sess = req.session;
  console.log('second')
  console.log(sess)
  const otp = req.body.otp.trim();
  if (sess.email && sess.password) {
    try {
      const otpAuth = await otpMod.findOne({ email: sess.email });
      const registerAuth = await registerMod.findOne({ email: sess.email });
      if (otpAuth && registerAuth) {
        if (otp != null) {
          if (otpAuth.expiresAt < Date.now()) {
            await otpMod.deleteOne({ email: sess.email });
            res.render("auth/otp", {
              msg: "Code has expired. Request for a new one.",
            });
          } else {
            const match = bcrypt.compareSync(otp, otpAuth.otp);
            if (match) {
              otpMod
                .findOneAndUpdate({ email: sess.email }, { verified: true })
                .then((result) => {
                  registerMod
                    .findOneAndUpdate({ email: sess.email }, { verified: true })
                    .then((result) => {
                      sess.identifier = "user";
                      res.redirect("/home");
                    })
                    .catch((error) => {
                      console.log(error);
                      next(error);
                    });
                })
                .catch((error) => {
                  console.log(error);
                  next(error);
                });
            } else {
              res.render("auth/otp", { msg: "Incorrect OTP!!!" });
            }
          }
        } else {
          res.render("auth/otp", { msg: "OTP cannot be Empty!" });
        }
      } else {
        sess.destroy();
        res.redirect("/");
      }
    } catch (error) {
      console.log(error);
      res.render("auth/otp", { msg: "An Error Occured!!!" });
    }
  } else {
    res.redirect("/");
  }
});

module.exports = router;

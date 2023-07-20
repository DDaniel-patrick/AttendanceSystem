const express = require("express");
const router = express.Router();

const registerMod = require("./../../models/user/auth/register");
const otpMod = require("./../../models/user/auth/otp");

const cloudinary = require("cloudinary");
const bcrypt = require("bcrypt");
const mailer = require("nodemailer");
const attendance = require("../../models/user/attendance/attendance");
const attendanceRegistrers = require("../../models/user/attendance/attendanceRegistrers");

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

router.get("/view", async (req, res) => {
  const sess = req.session;
  if (sess.email && sess.password && sess.identifier == "user") {
    const you = await registerMod.findOne({ email: sess.email });
    res.render("Dashboard/Profile/profile", { you });
  } else {
    res.redirect("/");
  }
});

router.get("/edit", async (req, res) => {
  const sess = req.session;
  if (sess.email && sess.password && sess.identifier == "user") {
    const you = await registerMod.findOne({ email: sess.email });
    res.render("Dashboard/Profile/editProfile", { you, msg: "" });
  } else {
    res.redirect("/");
  }
});

router.post("/edit", async (req, res, next) => {
  const sess = req.session;
  const fullName = req.body.name.trim();
  const phoneNumber = req.body.phone.trim();
  const dob = req.body.age.trim();
  const gender = req.body.gender.trim();
  const email = req.body.email.trim();
  if (sess.email && sess.password && sess.identifier == "user") {
    const you = await registerMod.findOne({ email: sess.email });
    const password = sess.password;
    const confirmPassword = sess.password;
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
              if (req.files != null) {
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
                  cloudinary.v2.uploader
                    .destroy(you.picturePublicID)
                    .then((result) => {
                      console.log(result);
                    });
                  const upload = await cloudinary.v2.uploader.upload(
                    profile.tempFilePath,
                    {
                      resource_type: "image",
                      folder: process.env.profilePictureFolder,
                      use_filename: false,
                      unique_filename: true,
                    }
                  );
                  registerMod
                    .findOneAndUpdate(
                      { email: sess.email },
                      {
                        name: fullName,
                        phone: phoneNumber,
                        age: age,
                        dob: dob,
                        gender: gender,
                        email: email,
                        picture: upload.secure_url,
                        password: bcrypt.hashSync(password, 10),
                        picturePublicID: upload.public_id,
                      }
                    )
                    .then((result) => {
                      sess.email = req.body.email;
                      sess.password = password;
                      sess.identifier = "user";

                      const mailThem = async () => {
                        const mailOption = {
                          from: `${process.env.adminName} ${process.env.email}`,
                          to: req.body.email,
                          subject: `Profile Info`,
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
                                                                      
                                                                      <p style="text-align: center;">Your Profile has been updated Succesfully</p>
                                                                                                                                                                                                  
                                                                      <p style="text-align: center;">Regards,<br>RealTime Attendance Team</p>
                                                                    </body>
                                                                    </html>
                                                                `,
                        };
                        await systemMail.sendMail(mailOption);
                      };
                      mailThem();
                      res.redirect("/profile/view");
                    })
                    .catch((error) => {
                      console.log(error);
                      next(error);
                    });
                } else {
                  res.render("Dashboard/Profile/editProfile", {
                    msg: "Invalid Image File Type!",
                    you,
                  });
                }
              } else {
                const profile = you.picture;
                const publicID = you.picturePublicID;
                registerMod
                  .findOneAndUpdate(
                    { email: sess.email },
                    {
                      name: fullName,
                      phone: phoneNumber,
                      age: age,
                      dob: dob,
                      gender: gender,
                      email: email,
                      picture: profile,
                      password: bcrypt.hashSync(password, 10),
                      picturePublicID: publicID,
                    }
                  )
                  .then((result) => {
                    sess.email = req.body.email;
                    sess.password = password;
                    sess.identifier = "user";

                    const mailThem = async () => {
                      const mailOption = {
                        from: `${process.env.adminName} ${process.env.email}`,
                        to: req.body.email,
                        subject: `Profile Info`,
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
                                                                  
                                                                  <p style="text-align: center;">Your Profile has been updated Succesfully</p>
                                                                                                                                                                                              
                                                                  <p style="text-align: center;">Regards,<br>RealTime Attendance Team</p>
                                                                </body>
                                                                </html>
                                                            `,
                      };
                      await systemMail.sendMail(mailOption);
                    };
                    mailThem();
                    res.redirect("/profile/view");
                  })
                  .catch((error) => {
                    console.log(error);
                    next(error);
                  });
              }
            } else {
              res.render("Dashboard/Profile/editProfile", {
                msg: "Password and Confirm Password has to be the same!",
                you,
              });
            }
          } else {
            res.render("Dashboard/Profile/editProfile", {
              msg: `You are not old enough to register. Try again in ${
                18 - age
              } year(s)!!!`,
              you,
            });
          }
        } else {
          res.render("Dashboard/Profile/editProfile", {
            msg: "Please fIll all Fields Correctly",
            you,
          });
        }
      } else {
        res.render("Dashboard/Profile/editProfile", {
          msg: "Please fill all the fields!",
          you,
        });
      }
    } catch (error) {
      console.log(error);
      res.render("Dashboard/Profile/editProfile", {
        msg: "An Error Occured!!!",
        you,
      });
    }
  } else {
    res.redirect("/");
  }
});

router.get("/delete", async (req, res, next) => {
  const sess = req.session;
  if (sess.email && sess.password && sess.identifier == "user") {
    await attendance.deleteMany({adminId:sess?._id})
await attendanceRegistrers.deleteMany({adminID:sess?._id})
    const you = await registerMod.findOne({ email: sess.email });
    cloudinary.v2.uploader.destroy(you.picturePublicID).then((result) => {
      console.log(result);
    });
    registerMod
      .findByIdAndDelete(you._id)
      .then((result) => {
        
        otpMod
          .findOneAndDelete({ email: sess.email })
          .then((result) => {
            const mailThem = async () => {
              const mailOption = {
                from: `${process.env.adminName} ${process.env.email}`,
                to: sess.email,
                subject: `Account Info`,
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
                                                            
                                                            <h3>Hello ${you.name},</h3>
                                                            
                                                            <p style="text-align: center;">Your Account has been deleted Succesfully</p>
                                                                                                                                                                                        
                                                            <p style="text-align: center;">Regards,<br>RealTime Attendance Team</p>
                                                          </body>
                                                          </html>
                                                      `,
              };
              await systemMail.sendMail(mailOption);
            };
            mailThem();
            sess.destroy();
            res.redirect("/");
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
    res.redirect("/");
  }
});

module.exports = router;

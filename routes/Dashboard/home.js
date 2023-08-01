const express = require('express')
const attendance = require('../../models/user/attendance/attendance')
const attendanceRegistrers = require('../../models/user/attendance/attendanceRegistrers')
const register = require('../../models/user/auth/register')
const linkModel = require('../../models/user/auth/link.model')
const { Sendmail } = require('../../utils/mailer.utils')
const { Errordisplay } = require('../../utils/Auth.utils')
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const sess = req.session
        if(sess.email && sess.password && sess.identifier === 'user') {
            let allAttendance = await attendance.find({adminId:sess?._id})
            res.render('Dashboard/home',{allAttendance})

        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
    
})

router.get('/facilitate/delete', async (req, res) => {
    try {
        const sess = req.session._id
        const AttendanceID= req.query.id
        
        let chkUser = sess?await register.findOne({_id:sess}):null
        let allcheck= AttendanceID?AttendanceID?.length==24?await attendance.findOne({_id:AttendanceID, adminId:sess}):null:null
        if(allcheck) {
            await linkModel.deleteOne({uniqueID:chkUser._id})
            let newlink= await linkModel.create({uniqueID:chkUser._id})

            let html= `
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
                  font-size: 20px;
                  font-weight: bold;
                  text-align: center;
                  margin-top: 40px;
                  margin-bottom: 50px;
                  color:white;
                  background-color: #1A1A1C;
                  text-align:center;
                  border-radius:50px;
                  padding:10px;
                }
              </style>
            </head>
            <body>
              <h1>Deleting Item comfirmation</h1>
              
              <h3>Hello ${chkUser.name},</h3>
              
              <p style="text-align: center;">Your One-Time Password (OTP) is:</p>
              <div style="width:100%;display:flex;justify-content:center;align-items:center">
              <a href='${process.env.website}/home/delete?email=${chkUser.email}&link=${newlink.link}&id=${AttendanceID}' class="otp-code">
                click me
              </a>
              </div>
              
              <p style="text-align: center;">Please use this OTP to complete your verification process. This Code expires in 1 hour.</p>
              
              <p style="text-align: center;">If you didn't request this OTP, please ignore this email.</p>
              
              <p style="text-align: center;">Regards,<br>RealTime Attendance Team</p>
            </body>
            </html>
        `
        await Sendmail(chkUser.email, "Attendance Deletion", html)
            res.render('success',{msg:"Comfirm your delete though your email"})
        } else {
            res.status(404).render('404')
        }
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
    
})

router.get('/delete', async (req, res) => {
    try {
        const sess = req.query.email
        const linkk= req.query.link
        const AttendanceID= req.query.id

        let chkUser = sess?await register.findOne({email:sess}):null
        let allcheck = chkUser?await linkModel.findOne({uniqueID:chkUser._id,link:linkk}):null
        if(allcheck) {

            AttendanceID?AttendanceID.length==24?await attendance.deleteOne({_id:AttendanceID, adminId:chkUser?._id}):null:null
            AttendanceID?AttendanceID.length==24?await attendanceRegistrers.deleteMany({attendanceId:AttendanceID, adminId:chkUser?._id}):null:null
            await linkModel.deleteOne({uniqueID:chkUser._id})
            res.render('success',{msg:"Deleted item succesfully"})
        } else {
            res.status(404).render('404')
        }
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
    
})

module.exports = router
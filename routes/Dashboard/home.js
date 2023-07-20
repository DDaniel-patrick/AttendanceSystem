const express = require('express')
const attendance = require('../../models/user/attendance/attendance')
const attendanceRegistrers = require('../../models/user/attendance/attendanceRegistrers')
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

router.get('/delete', async (req, res) => {
    try {
        const sess = req.session

        const AttendanceID= req.query.id
        if(sess.email && sess.password && sess.identifier === 'user') {

            AttendanceID?AttendanceID.length==24?await attendance.deleteOne({_id:AttendanceID, adminId:sess?._id}):null:null
            AttendanceID?AttendanceID.length==24?await attendanceRegistrers.deleteMany({attendanceId:AttendanceID, adminId:sess?._id}):null:null
            res.redirect('/')
        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
    
})

module.exports = router
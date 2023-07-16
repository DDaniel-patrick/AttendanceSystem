const express = require('express')
const attendance = require('../../models/user/attendance/attendance')
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

module.exports = router
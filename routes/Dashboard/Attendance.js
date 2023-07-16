const express = require("express");
const router = express.Router();

const { Errordisplay } = require("../../utils/Auth.utils");
const register = require("./../../models/user/auth/register");
const attendance = require("../../models/user/attendance/attendance");
const attendanceRegistrers = require("../../models/user/attendance/attendanceRegistrers");

router.get("/add",async (req, res) => {
    try {
        let Auth = req.session._id

        let checkAuth= (Auth?.length==24)?await register.findOne({_id:Auth, verified:true}):null

        checkAuth?res.render("Dashboard/AddAttendance",{msg:''}):res.redirect('/')
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
});


router.post("/add",async (req, res) => {
    try {
        let collect = req.body

        let Auth = req.session._id

        let checkAuth= (Auth?.length==24)?await register.findOne({_id:Auth, verified:true}):null

        checkAuth?collect.adminId=Auth:null

        let addAttendance=checkAuth?await attendance.create(collect):res.redirect('/')



        checkAuth?res.redirect(`/attendance/view/${addAttendance._id}`):res.redirect('/')
    } catch (error) {
        res.status(500).render('Dashboard/AddAttendance',{msg:Errordisplay(error).msg})
    }
});

router.get("/view/:id",async (req, res) => {
    try {
        let Auth = req.session._id

        let ID = req.params.id
        let checkAuth= (Auth?.length==24)?await register.findOne({_id:Auth, verified:true}):null

        let chkAttendance = checkAuth?ID?.length==24?await attendance.findOne({_id:ID, adminId:Auth}) :null:null

        let AllAttendee = chkAttendance?await attendanceRegistrers.find({attendanceId:ID, present:true}):null

        let AllAbsenseAttendee = chkAttendance?await attendanceRegistrers.find({attendanceId:ID, present:false}):null

        chkAttendance?res.render("Dashboard/ViewAttendance",{Details:chkAttendance,AllAttendee, website:process.env.website,AllAbsenseAttendee }):res.status(404).render('404')
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
});

router.get("/single/:id",async (req, res) => {
    try {
       
        let ID = req.params.id

        let chkAttendance = ID?.length==24?await attendance.findOne({_id:ID, closed:false}) :null

        chkAttendance?res.render("Dashboard/AddAttendee",{Details:chkAttendance,msg:""}):res.status(404).render('404')
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
});

router.post("/single/:id",async (req, res) => {
    try {
       
        let ID = req.params.id

        let collect= req.body
        console.log(collect);
        let chkAttendance = ID?.length==24?await attendance.findOne({_id:ID, closed:false}) :null
        
        chkAttendance?await attendanceRegistrers.create({name:collect?.name, attendanceId:ID, present:collect?.absent=="true"?false:true, Reason:collect?.reasonAbsent}):null

        chkAttendance?res.render('success',{msg:"Thanks for Registering"}):res.status(404).render('404')
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
});


router.get("/close/:id",async (req, res) => {
    try {
        let Auth = req.session._id

        let valueofSwitch=`${req.query.switch}`
        let ID = req.params.id
        let checkAuth= (Auth?.length==24)?await register.findOne({_id:Auth, verified:true}):null

        console.log(valueofSwitch);
        let chkAttendance = checkAuth?ID?.length==24?await attendance.updateOne({_id:ID, adminId:Auth},{closed:valueofSwitch==="yes"?false:true}) :null:null


        chkAttendance?res.redirect('/attendance/view/'+ID):res.status(404).render('404')
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
});

router.get("/remove/:id",async (req, res) => {
    try {
        let Auth = req.session._id

        let user=`${req.query.user}`

        let ID = req.params.id
        let checkAuth= (Auth?.length==24)?await register.findOne({_id:Auth, verified:true}):null

        let chkAttendance = checkAuth?ID?.length==24?await attendance.findOne({_id:ID, adminId:Auth}) :null:null

        chkAttendance?user?.length==24?await attendanceRegistrers.deleteOne({attendanceId:ID, _id:user, present:true}):null:null
        

        chkAttendance?res.redirect('/attendance/view/'+ID):res.status(404).render('404')
    } catch (error) {
        res.status(500).render('500',{msg:Errordisplay(error).msg})
    }
});

module.exports = router;

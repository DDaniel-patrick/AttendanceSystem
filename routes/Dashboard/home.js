const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    const sess = req.session
    if(sess.email && sess.password && sess.identifier === 'user') {
        res.render('Dashboard/home')
    } else {
        res.redirect('/')
    }
})

module.exports = router
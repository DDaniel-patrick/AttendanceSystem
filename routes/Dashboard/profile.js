const express = require("express");
const router = express.Router();

const registerMod = require("./../../models/user/auth/register");

router.get("/view", async (req, res) => {
  const sess = req.session;
  if (sess.email && sess.password && sess.identifier == "user") {
    const you = await registerMod.findOne({ email: sess.email });
    res.render("Dashboard/profile", { you });
  } else {
    res.redirect("/");
  }
});

module.exports = router;

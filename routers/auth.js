const express = require("express");
const { signup, verify, signin } = require("../controllers/auth");
const router = express.Router(); 

router
   .post("/signup", signup)
   .post("/verify", verify)
   .post("/signin", signin)

module.exports = router;
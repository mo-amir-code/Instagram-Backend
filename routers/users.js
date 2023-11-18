const express = require("express");
const { fetchMyUser, updateMyUser, fetchUser } = require("../controllers/users");
const router = express.Router(); 

router
   .get("/myuser", fetchMyUser)
   .patch("/update-myuser", updateMyUser)
   .get("/user", fetchUser)

module.exports = router;
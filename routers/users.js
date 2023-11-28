const express = require("express");
const { fetchMyUser, updateMyUser, fetchUser, fetchFeatureUsers } = require("../controllers/users");
const router = express.Router(); 

router
   .get("/myuser", fetchMyUser)
   .patch("/update-myuser", updateMyUser)
   .get("/user", fetchUser)
   .get("/fetch-feature-users", fetchFeatureUsers)

module.exports = router;
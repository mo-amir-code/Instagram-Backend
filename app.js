const express = require("express");
const cors = require("cors");
const { connectToDB } = require("./services/Database");
const router = require("./routers");


const app = express();
app.use(cors());
app.use(express.json({limit: "25mb"}));
app.use(express.urlencoded({limit: "25mb", extended: true}));

app.use(router);


connectToDB().catch((err)=>{
    console.log(err.message, "Database connection error");
})



module.exports = app;

const mongoose = require("mongoose");
require("dotenv").config();

exports.connectToDB = async () => {
    await mongoose.connect(process.env.LOCAL_DB_URI);
    console.log("Databse connected....");
}
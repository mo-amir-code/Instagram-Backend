require("dotenv/config");
const express = require("express");
const { connectToDB } = require("./services/Database");
const router = require("./routers");
const cors = require("cors");

const whitelist = ["https://instagram-fullstack-amir.vercel.app"];

const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}

const app = express();

app.use(cors(corsOptions))
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
//   res.setHeader('Access-Control-Allow-Credentials', "true");
//   next();
// });

app.use(router);

connectToDB().catch((err) => {
  console.log(err.message, "Database connection error");
});

module.exports = app;

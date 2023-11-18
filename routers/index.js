const express = require("express");
const router = express.Router();
const authRouter = require("./auth");
const userRouter = require("./users");
const appRouter = require("./app");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/app", appRouter);

module.exports = router

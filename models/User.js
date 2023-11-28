const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String },
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    category: { type: String },
    password: { type: String, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "TRANSGENDER"] },
    followers: [{ type: String, ref: "User" }],
    following: [{ type: String, ref: "User" }],
    saved: [{ type: Schema.Types.ObjectId, ref: "Post" || "Reel" }],
    verified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiryTime: { type: Date },
    token: { type: String },
    passwordResetToken: { type: String },
    socketId: { type: String },
    status: { type: String, enum:["online", "offline"] },
  },
  {
    timestamps: true,
  }
);

const virtual = userSchema.virtual("id");
virtual.get(function () {
  return this._id;
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;

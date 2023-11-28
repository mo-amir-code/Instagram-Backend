const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    thumbnail: { type: String, required: true },
    type: { type: String, enum: ["like", "comment"] },
    contentType: { type: String, enum: ["reel", "post"] },
    message: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    postId: { type: String, required: true },
    postUser: { type: Schema.Types.ObjectId, ref: "User" },
    seen: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const virtual = notificationSchema.virtual("id");
virtual.get(function () {
  return this._id;
});

notificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;

const mongoose = require("mongoose");
const { Schema } = mongoose;

const duoChatSchema = new Schema(
  {
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    conversation: [
      {
        toUserId: { type: Schema.Types.ObjectId, ref: "User" },
        fromUserId: { type: Schema.Types.ObjectId, ref: "User" },
        message: { type: String },
        type: {
          type: String,
          enum: ["text", "image", "video", "sharedReel", "sharedPost"],
          default: "text"
        },
        read: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const virtual = duoChatSchema.virtual("id");
virtual.get(function () {
  return this._id;
});

duoChatSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const DuoChat = mongoose.model("DuoChat", duoChatSchema);
module.exports = DuoChat;

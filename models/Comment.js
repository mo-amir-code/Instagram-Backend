const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        reply: [{
          user: { type: Schema.Types.ObjectId, ref: "User" },
          comment: { type: String },
          likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
          time: { type: Date },
        }],
        time: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const virtual = commentSchema.virtual("id");
virtual.get(function () {
  return this._id;
});

commentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;

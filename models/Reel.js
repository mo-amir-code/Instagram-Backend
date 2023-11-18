const mongoose = require("mongoose");
const { Schema } = mongoose;

const reelSchema = new Schema({
    description:{type:String},
    file:{type:String, required:true},
    user:{type:Schema.Types.ObjectId, required:true, ref: "User"},
    likes:[{type:Schema.Types.ObjectId, default:null, ref: "User"}],
    comments:{type:Schema.Types.ObjectId, default:null, ref: "Comment"},
    saved:[{type:Schema.Types.ObjectId, default:null, ref: "User"}],
    shares:{type:Number, default:0},
    status:{type:String, enum:["publish", "private", "draft"], default:"publish"}
}, {
    timestamps:true
});

const virtual = reelSchema.virtual("id");
virtual.get(function () {
  return this._id;
});

reelSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});


const Reel = mongoose.model("Reel", reelSchema);
module.exports = Reel;
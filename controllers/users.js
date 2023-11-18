const User = require("../models/User");
const Post = require("../models/Post");
const { structuredData } = require("../services/userServices");
const { uploadImageOnCloudinary } = require("../services/UploadCloudinary");

exports.fetchMyUser = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await User.findById(id).select(
      "id name username email avatar followers following bio category"
    );
    const posts = await Post.countDocuments({ user: user.id });
    const data = structuredData(user, posts);

    res
      .status(200)
      .json({ status: "success", message: "User fetched successfully!", data });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.updateMyUser = async (req, res) => {
  try {
    const { avatar, id } = req.body;

    if(avatar){
      const url = await uploadImageOnCloudinary(avatar, "images");
      req.body.avatar = url;
    }else{
      delete req.body.avatar;
    }

    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("id name username email avatar followers following bio category");

    res
      .status(200)
      .json({
        status: "success",
        message: "User updated successfully!",
        data: user,
      });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchUser = async (req, res) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({username:username}).select(
      "id name username email avatar followers following bio category"
    );
    const posts = await Post.countDocuments({ user: user.id });
    const data = structuredData(user, posts);


    res
      .status(200)
      .json({ status: "success", message: "User fetched successfully!", data });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

const { uploadImageOnCloudinary } = require("../services/UploadCloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Reel = require("../models/Reel");
const { arrangePosts } = require("../services/appServices");

exports.createPost = async (req, res) => {
  try {
    const file = await uploadImageOnCloudinary(req.body.file, "images");
    let data = req.body;
    data.file = file;

    const post = new Post(data);
    const comment = new Comment({ post: post.id });
    post.comments = comment.id;
    await post.save();
    await comment.save();

    res
      .status(200)
      .json({ status: "success", message: "Your post uploaded😊" });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.createVideoPost = async (req, res) => {
  try {
    const file = await uploadImageOnCloudinary(req.body.file, "videos");
    let data = req.body;
    data.file = file;

    console.log(file);

    const reel = new Reel(data);
    const comment = new Comment({ post: reel.id });
    reel.comments = comment.id;
    await reel.save();
    await comment.save();

    res
      .status(200)
      .json({ status: "success", message: "Your reel uploaded😊" });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchMyUserPosts = async (req, res) => {
  try {
    const { id } = req.query;
    let posts = await Post.find({ user: id })
      .select("description file user likes comments")
      .populate("comments");

    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      return newPost;
    });

    res.status(200).json({
      status: "success",
      message: "Your posts have been founded",
      data: modifiedPosts,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchUserPosts = async (req, res) => {
  try {
    const { username } = req.query;
    const user = await User.findOne({ username: username }).select("name");
    let posts = await Post.find({ user: user._id })
      .select("description file user likes comments")
      .populate("comments");

    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      return newPost;
    });

    res.status(200).json({
      status: "success",
      message: "Your posts have been founded",
      data: modifiedPosts,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchPosts = async (req, res) => {
  try {
    const { results, totalResult } = req.query;
    let tr = totalResult;
    const postCount = await Post.countDocuments();
    if (!totalResult || totalResult < postCount) {
      tr = postCount;
    }

    const posts = await Post.find()
      .skip(results)
      .select("description file user likes comments saved createdAt")
      .populate("user", "id name username avatar")
      .populate("comments");
    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      newPost["type"] = "post";
      return newPost;
    });

    res.status(200).json({
      status: "success",
      message: "Your posts have been founded",
      data: modifiedPosts,
      totalResult: tr,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });

    res.status(200).json({
      status: "success",
      message: "Post Liked",
      data: { postId, userId },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.removeLike = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });

    res.status(200).json({
      status: "success",
      message: "Like removed",
      data: { postId, userId },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.postComment = async (req, res) => {
  try {
    const { postId, comment } = req.body;

    const uComment = await Comment.findOneAndUpdate(
      { post: postId },
      { $push: { comments: comment } },
      { new: true }
    ).populate("comments.user");

    const rC = uComment.comments.at(-1);

    res.status(200).json({
      status: "success",
      message: "Comment posted",
      postId,
      comment: rC,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    await User.findByIdAndUpdate(userId, { $push: { saved: postId } });
    await Post.findByIdAndUpdate(postId, { $push: { saved: userId } });

    res.status(200).json({
      status: "success",
      message: "Post saved",
      data: {
        savedId: userId,
        postId,
      },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.removeSavedPost = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    await Post.findByIdAndUpdate(postId, { $pull: { saved: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { saved: postId } });

    res.status(200).json({
      status: "success",
      message: "Unsaved",
      data: { postId, savedId: userId },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { postUserName, postUser, user } = req.body;

    await User.findByIdAndUpdate(postUser, { $push: { followers: user } });
    await User.findByIdAndUpdate(user, { $push: { following: postUser } });

    res.status(200).json({
      status: "success",
      message: `Your are following ${postUserName}`,
      data: {
        postUser,
        user,
      },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.unFollowUser = async (req, res) => {
  try {
    const { postUserName, postUser, user } = req.body;

    await User.findByIdAndUpdate(postUser, { $pull: { followers: user } });
    await User.findByIdAndUpdate(user, { $pull: { following: postUser } });

    res.status(200).json({
      status: "success",
      message: `Unfollowed, ${postUserName}`,
      data: {
        postUser,
        user,
      },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchPost = async (req, res) => {
  try {
    const { id } = req.query;
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        select: "comments -_id",
        populate: { path: "comments.user", select: "avatar username" },
      })
      .populate("user", "username avatar")
      .select("-updatedAt -__v -status");

    const newPost = { ...post.toObject() };
    newPost.comments = post.comments.comments;

    res.status(200).json({
      status: "success",
      message: `Post information fetched`,
      data: newPost,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchExplore = async (req, res) => {
  try {
    const { results, totalResult } = req.query;
    let tr = totalResult;
    const postCount = await Post.countDocuments();
    if (!totalResult || totalResult < postCount) {
      tr = postCount;
    }

    const posts = await Post.find()
      .skip(results)
      .limit(12)
      .select("description file likes comments")
      .populate("comments");
    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      // newPost.likes = post.likes.length;
      newPost["type"] = "post";
      return newPost;
    });

    // const exploreContent = arrangePosts(modifiedPosts);
    // console.log(exploreContent);

    res.status(200).json({
      status: "success",
      message: "Your posts have been founded",
      data: modifiedPosts,
      totalResult: tr,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.commentLike = async (req, res) => {
  try {
    const { commentPostId, likedCommentId, user } = req.body;
    const comment = await Comment.findOne({post:commentPostId});
    const likedCommentIndex = comment.comments.findIndex(
      (el) => el._id == likedCommentId
    );
    comment.comments[likedCommentIndex].likes.push(user);
    await comment.save();

    res.status(200).json({
      status: "success",
      message: `Liked comment`,
      data: { likedCommentId, user },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.removeCommentLike = async (req, res) => {
  try {
    const { commentPostId, unLikedCommentId, user } = req.body;
    const comment = await Comment.findOne({post:commentPostId});
    const likedCommentIndex = comment.comments.findIndex(
      (el) => el._id == unLikedCommentId
    );
    const filteredLikes = comment.comments[likedCommentIndex].likes.filter(
      (el) => el != user
    );
    comment.comments[likedCommentIndex].likes = filteredLikes;
    await comment.save();

    res.status(200).json({
      status: "success",
      message: `Removed Liked comment`,
      data: { unLikedCommentId, user },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

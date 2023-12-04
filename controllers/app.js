const { uploadImageOnCloudinary } = require("../services/UploadCloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Reel = require("../models/Reel");
const Notification = require("../models/Notification");

const {
  sortAccordingUpload,
  createNotification,
  markAsSeen,
} = require("../services/appServices");
const { takeScreenshot } = require("../services/puppeteer");

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
    const file = await uploadImageOnCloudinary(req.file.buffer, "videos");
    let data = req.body;
    data["file"] = file;

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
      .select("description file user likes comments createdAt")
      .populate("comments");

    let reels = await Reel.find({ user: id })
      .select("description file user likes comments createdAt")
      .populate("comments");

    const savedPosts = await Post.find({ saved: id })
      .select("description file user likes comments createdAt")
      .populate("comments");
    const modifiedSavedPosts = savedPosts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      newPost["type"] = "post";
      return newPost;
    });
    const savedReels = await Reel.find({ saved: id })
      .select("description file user likes comments createdAt")
      .populate("comments");
    const modifiedSavedReels = savedReels.map((reel) => {
      const newPost = { ...reel.toObject() };
      newPost.comments = reel.comments.comments.length;
      newPost["type"] = "reel";
      return newPost;
    });

    const readySaved = modifiedSavedPosts;
    modifiedSavedReels.forEach((reel) => {
      const randomNumber = Math.round(
        Math.random() * modifiedSavedPosts.length
      );
      readySaved.splice(randomNumber, 0, reel);
    });

    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      newPost["type"] = "post";
      return newPost;
    });

    const modifiedReels = reels.map((reel) => {
      const newPost = { ...reel.toObject() };
      newPost.comments = reel.comments.comments.length;
      newPost["type"] = "reel";
      return newPost;
    });

    const readyPosts = sortAccordingUpload(modifiedPosts, modifiedReels);

    res.status(200).json({
      status: "success",
      message: "Your posts have been founded",
      data: readyPosts,
      saved: readySaved,
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
    let posts = await Post.find({ user: user.id })
      .select("description file user likes comments createdAt")
      .populate("comments");
    let reels = await Reel.find({ user: user.id })
      .select("description file user likes comments createdAt")
      .populate("comments");

    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      newPost["type"] = "post";
      return newPost;
    });

    const modifiedReels = reels.map((reel) => {
      const newPost = { ...reel.toObject() };
      newPost.comments = reel.comments.comments.length;
      newPost["type"] = "reel";
      return newPost;
    });

    const readyPosts = sortAccordingUpload(modifiedPosts, modifiedReels);

    res.status(200).json({
      status: "success",
      message: "Your posts have been founded",
      data: readyPosts,
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
    const reelCount = await Reel.countDocuments();
    if (!totalResult || totalResult < postCount + reelCount) {
      tr = postCount + reelCount;
    }

    const posts = await Post.find()
      .skip(results)
      .select("description file user likes comments saved createdAt")
      .populate("user", "id name username avatar")
      .populate("comments");
    const reels = await Reel.find()
      // .skip(1)
      .select("description file user likes comments saved createdAt")
      .populate("user", "id name username avatar")
      .populate("comments");
    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      newPost["type"] = "post";
      return newPost;
    });
    const modifiedReels = reels.map((reel) => {
      const newPost = { ...reel.toObject() };
      newPost.comments = reel.comments.comments.length;
      newPost["type"] = "reel";
      return newPost;
    });

    modifiedReels.forEach((el) => {
      const randomNumber = Math.floor(Math.random() * modifiedPosts.length);
      modifiedPosts.splice(randomNumber, 0, el);
    });

    // const readyPosts = [...modifiedPosts, ...modifiedReels];

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
    const { postId, userId, type } = req.body;
    let post;
    let reel;
    if (type === "post") {
      post = await Post.findByIdAndUpdate(postId, {
        $push: { likes: userId },
      }).select("file user");
    } else {
      reel = await Reel.findByIdAndUpdate(postId, {
        $push: { likes: userId },
      }).select("file user");
    }

    let videoScreenShotUrl;
    const notificationData = {
      thumbnail: null,
      type: "like",
      contentType: null,
      message: "",
      user: userId,
      postId: null,
      postUser: null,
    };

    if (post) {
      videoScreenShotUrl = post.file;
      notificationData.thumbnail = videoScreenShotUrl;
      notificationData.contentType = "post";
      notificationData.postId = post.id;
      notificationData.postUser = post.user;
      createNotification(notificationData);
    } else {
      notificationData.contentType = "reel";
      notificationData.postId = reel.id;
      notificationData.postUser = reel.user;
      createNotification(notificationData, reel.file);
    }

    res.status(200).json({
      status: "success",
      message: "Post Liked",
      data: { postId, userId, type },
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
    const { postId, userId, type } = req.body;
    if (type === "post") {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    } else {
      await Reel.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    }

    res.status(200).json({
      status: "success",
      message: "Like removed",
      data: { postId, userId, type },
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
    const { postId, comment, type } = req.body;

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
    const { postId, userId, type } = req.body;

    await User.findByIdAndUpdate(userId, { $push: { saved: postId } });
    if (type === "post") {
      await Post.findByIdAndUpdate(postId, { $push: { saved: userId } });
    } else {
      await Reel.findByIdAndUpdate(postId, { $push: { saved: userId } });
    }

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
    const { postId, userId, type } = req.body;
    if (type === "post") {
      await Post.findByIdAndUpdate(postId, { $pull: { saved: userId } });
    } else {
      await Reel.findByIdAndUpdate(postId, { $pull: { saved: userId } });
    }
    await User.findByIdAndUpdate(userId, { $pull: { saved: postId } });

    // console.log(postId, userId);

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

    const reel = await Reel.findById(id)
      .populate({
        path: "comments",
        select: "comments -_id",
        populate: { path: "comments.user", select: "avatar username" },
      })
      .populate("user", "username avatar")
      .select("-updatedAt -__v -status");

    let newPost;
    if (post) {
      newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments;
      newPost["type"] = "post";
    } else {
      newPost = { ...reel.toObject() };
      newPost.comments = reel.comments.comments;
      newPost["type"] = "reel";
    }

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
    console.log(req.query);
    let tr = totalResult;
    const postCount = await Post.countDocuments();
    const reelCount = await Reel.countDocuments();
    if (!totalResult || totalResult < postCount + reelCount) {
      tr = postCount + reelCount;
    }

    const posts = await Post.find()
      .skip(results * 0.7)
      .limit(8)
      .select("description file likes comments")
      .populate("comments");

    const reels = await Reel.find()
      .skip(results * 0.3)
      .limit(4)
      .select("description file likes comments")
      .populate("comments");
    const modifiedPosts = posts.map((post) => {
      const newPost = { ...post.toObject() };
      newPost.comments = post.comments.comments.length;
      // newPost.likes = post.likes.length;
      newPost["type"] = "post";
      return newPost;
    });

    const modifiedReels = reels.map((reel) => {
      const newPost = { ...reel.toObject() };
      newPost.comments = reel.comments.comments.length;
      // newPost.likes = post.likes.length;
      newPost["type"] = "reel";
      return newPost;
    });

    modifiedReels.forEach((el) => {
      const randomNumber = Math.floor(Math.random() * modifiedPosts.length);
      modifiedPosts.splice(randomNumber, 0, el);
    });

    // const readyExplorePosts = [...modifiedPosts, ...modifiedReels];

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
    const comment = await Comment.findOne({ post: commentPostId });
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
    const comment = await Comment.findOne({ post: commentPostId });
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

exports.fetchReels = async (req, res) => {
  try {
    const { results, totalResult } = req.query;
    let tr = totalResult;
    const reelCount = await Reel.countDocuments();
    if (!totalResult || totalResult < reelCount) {
      tr = reelCount;
    }

    const reels = await Reel.find()
      .skip(results)
      .limit(3)
      .select("description file user likes comments saved")
      .populate("user", "id name username avatar")
      .populate("comments");

    const modifiedReels = reels.map((reel) => {
      const newPost = { ...reel.toObject() };
      newPost.comments = reel.comments.comments.length;
      return newPost;
    });

    res.status(200).json({
      status: "success",
      message: "Your reels have been fetched",
      data: modifiedReels,
      totalResult: tr,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchSeachResults = async (req, res) => {
  try {
    const { searching, user } = req.query;

    let results = await User.find({
      $or: [
        { username: { $regex: searching, $options: "i" } },
        { name: { $regex: searching, $options: "i" } },
      ],
    }).select("name username avatar");

    if (user) {
      const newUsers = results.filter((el) => el.id !== user);
      results = newUsers;
    }

    res.status(200).json({
      status: "success",
      message: "Post Liked",
      data: results,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchNotificationsCount = async (req, res) => {
  try {
    const { userId } = req.query;

    // const notifications = await Notification.find({ postUser: userId });
    const likesCount = await Notification.countDocuments({
      postUser: userId,
      type: "like",
      seen: false,
    });
    const commentsCount = await Notification.countDocuments({
      postUser: userId,
      type: "comment",
      seen: false,
    });

    res.status(200).json({
      status: "success",
      message: "Notification count fetched successfully",
      data: { likesCount, commentsCount },
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.fetchNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    // const notifications = await Notification.find({ postUser: userId });
    const notifications = await Notification.find({
      postUser: userId,
    }).populate("user", "name username avatar");

    markAsSeen(notifications);

    res.status(200).json({
      status: "success",
      message: "Notification fetched successfully",
      data: notifications,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

const express = require("express");
const multer = require("multer");
const {
  createPost,
  fetchMyUserPosts,
  fetchPosts,
  likePost,
  removeLike,
  postComment,
  savePost,
  removeSavedPost,
  followUser,
  unFollowUser,
  fetchPost,
  fetchExplore,
  fetchUserPosts,
  commentLike,
  removeCommentLike,
  createVideoPost,
  fetchReels,
  fetchSeachResults,
  fetchNotificationsCount,
  fetchNotifications,
} = require("../controllers/app");

const stoarge = multer.memoryStorage();
const upload = multer({ storage: stoarge });

const router = express.Router();

router
  .post("/new-post", createPost)
  .post("/new-video-post", upload.single("video"), createVideoPost)
  .get("/fetch-my-user-posts", fetchMyUserPosts)
  .get("/fetch-user-posts", fetchUserPosts)
  .get("/fetch-search-results", fetchSeachResults)
  .get("/fetch-posts", fetchPosts)
  .get("/fetch-reels", fetchReels)
  .patch("/like-post", likePost)
  .patch("/remove-like", removeLike)
  .patch("/post-comment", postComment)
  .patch("/save-post", savePost)
  .patch("/remove-saved-post", removeSavedPost)
  .patch("/follow-user", followUser)
  .patch("/unfollow-user", unFollowUser)
  .get("/fetch-post", fetchPost)
  .get("/fetch-explore", fetchExplore)
  .patch("/comment-like", commentLike)
  .patch("/remove-comment-like", removeCommentLike)
  .get("/fetch-notifications-count", fetchNotificationsCount)
  .get("/fetch-notifications", fetchNotifications);

module.exports = router;

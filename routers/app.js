const express = require("express");
const { createPost, fetchMyUserPosts, fetchPosts, likePost, removeLike, postComment, savePost, removeSavedPost, followUser, unFollowUser, fetchPost, fetchExplore, fetchUserPosts, commentLike, removeCommentLike, createVideoPost } = require("../controllers/app");
const router = express.Router(); 

router
   .post("/new-post", createPost)
   .post("/new-video-post", createVideoPost)
   .get("/fetch-my-user-posts", fetchMyUserPosts)
   .get("/fetch-user-posts", fetchUserPosts)
   .get("/fetch-posts", fetchPosts)
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

module.exports = router;
exports.arrangePosts = (posts) => {
  // console.
  const newPosts = [];
  for (let i = 0; i < posts.length; i++) {
    if (newPosts.length === 0) {
      newPosts.push(posts[i]);
    }
    for (let j = 0; j < i; j++) {
        const newPostCount = newPosts[j].likes + newPosts[j].comments;
        const oldPostCount = posts[i].likes + posts[i].comments;
        // console.log(newPostCount, oldPostCount, "under");
      if (newPostCount < oldPostCount) {
        splice(j, 0, posts[i]);
        console.log(newPosts);
      }
    }
  }

  return newPosts;
};

exports.structuredData = (user, posts) => {
  const userData = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio:user.bio,
    category:user.category,
    followers: user.followers,
    following: user.following,
    posts: posts,
  };
  return userData;
};

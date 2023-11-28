const Notification = require("../models/Notification");
const { uploadImageOnCloudinary } = require("./UploadCloudinary");
const { takeScreenshot } = require("./puppeteer");

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

exports.sortAccordingUpload = (posts, reels) => {
  const readyPosts = posts.reverse();
  let readyPostsLength = readyPosts.length;
  for (let i = 0; i < reels.length; i++) {
    for (let j = 0; j < readyPostsLength; j++) {
      if (readyPosts[j].createdAt < reels[i].createdAt) {
        readyPosts.splice(j, 0, reels[i]);
        break;
      }
    }
    if (readyPosts.length === readyPostsLength) {
      readyPosts.push(reels[i]);
    }
    readyPostsLength = readyPosts.length;
  }

  return readyPosts;
};

exports.checkIncoming = (loggedInUserId, fromUserId) => {
  if (loggedInUserId === fromUserId) {
    return false;
  } else {
    return true;
  }
};

exports.createNotification = async (data, file) => {
  if (data.contentType === "reel") {
    const urlBuffer = await takeScreenshot(file);
    const videoScreenShotUrl = await uploadImageOnCloudinary(
      urlBuffer,
      "screenshots"
    );
    data.thumbnail = videoScreenShotUrl;
  }

  await new Notification(data).save();
};

exports.markAsSeen = async (notifications) => {
  notifications.forEach(async (ntf) => {
    await Notification.findByIdAndUpdate(ntf.id, { seen: true });
  });
};

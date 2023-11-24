const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadVideoOptions = {
  stream:true,
  resource_type: "video",
};
const uploadImageOptions = {
  stream:true,
  resource_type: "image",
};

exports.uploadImageOnCloudinary = (file, type) => {
  return new Promise(async (resolved, rejected) => {
    console.log(file, type);
    try {
      if (type !== "videos") {
        cloudinary.uploader
          .upload(file, { folder: type })
          .then((result) => {
            resolved(result.url);
          })
          .catch((err) => {
            console.log(err);
            rejected(err);
          });
      } else {
        cloudinary.uploader.upload_stream(
          { folder: 'videos', ...uploadOptions, },
          (error, result) => {
            if (error) {
              console.error(error);
              rejected(error.message);
            } else {
              resolved(result.url);
            }
          }
        ).end(file);
      }
    } catch (err) {
      console.log(err.message);
    }
  });
};

exports.uploadOnCloudinaryForChat = (file, type) => {
  return new Promise(async (resolved, rejected) => {
    // console.log(file, type);
    try {
      if (type !== "videos") {
        cloudinary.uploader.upload_stream(
          { folder: 'images', ...uploadImageOptions, },
          (error, result) => {
            if (error) {
              console.error(error);
              rejected(error.message);
            } else {
              resolved(result.url);
            }
          }
        ).end(file);
      } else {
        cloudinary.uploader.upload_stream(
          { folder: 'videos', ...uploadVideoOptions, },
          (error, result) => {
            if (error) {
              console.error(error);
              rejected(error.message);
            } else {
              resolved(result.url);
            }
          }
        ).end(file);
      }
    } catch (err) {
      console.log(err.message);
    }
  });
};

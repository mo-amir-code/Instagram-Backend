const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploadImageOnCloudinary = (file, type) => {
  return new Promise(async (resolved, rejected) => {
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
        cloudinary.uploader
          .upload(file, {
            folder: type,
            resource_type: 'video',
            transformation: [
              { start_offset: "7.0" },
              {
                aspect_ratio: "9:16",
                gravity: "auto",
                height: 500,
                crop: "fill_pad",
              },
            ],
          })
          .then((result) => {
            resolved(result.url);
          })
          .catch((err) => {
            console.log(err);
            rejected(err);
          });
      }
    } catch (err) {
      console.log(err.message)
    }
  });
};

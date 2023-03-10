const CustomError = require("../errors");
const path = require("path");
const cloudinary = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: "wdsdf",
  api_key: "396184844824448",
  api_secret: "T4MWTzMBU8q_AYVM3y3byXECzsc",
  secure: true,
});

const uploadImageLocal = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError("Please upload image smaller 1MB");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  return res.status(200).json({
    image: { src: `http://localhost:5000/uploads/${productImage.name}` },
  });
};

const uploadImageCloudinary = async (req, res) => {
  const result = await cloudinary.v2.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "file-upload",
    }
  );
  fs.unlinkSync(req.files.image.tempFilePath);
  return res.status(201).json({ image: { src: result.secure_url } });
};
module.exports = {
  uploadImageCloudinary,
  uploadImageLocal,
};

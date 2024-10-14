const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const config = require("../config/config");
const file = require('../models/FilePath');

var uploader=multer({
  storage:multer.diskStorage({}),
  limits:{filesize:1000000}
});

cloudinary.config({
  cloud_name:config.CloudName,
  api_key:config.ApiKey,
  api_secret:config.ApiSecret
})

const uploadFile = async (req,res,next)=>{
  try{
    const filePath = req.file.path;
    const result = await cloudinary.uploader.upload(filePath)
    req.cloudinaryResult = result;
    next();
  }
  catch (error) {
      res.status(400).json({ message: 'Error Uploading file' });
  }
}

const uploadinDB = async (req, res) => {
  try {
    const upload = req.cloudinaryResult;

    const store = new file({
      file_url: upload.secure_url
    });

    const record = await store.save();

    res.status(200).json({
      success: true,
      msg: 'File Uploaded Successfully!',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      msg: error.message
    });
  }
};

module.exports = {uploader,uploadFile,uploadinDB}
const express = require("express");
const app = express.Router();
const fs = require("fs");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

var imageData = require("./images.json");

const utility = require("./utility.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// lists photos in gallery
app.get("/gallery/:path(*)", (req, res) => {
  var data = { gallery: {} };
  data.gallery = imageData.galleries.find(
    (gallery) => gallery.name === req.params.path
  );
  if (data.gallery != undefined) {
    return res.status(200).json(data);
  } else {
    return res.status(404).json({ msg: "Gallery does not exist" });
  }
});

//delete photo or gallery
app.delete("/gallery/:path(*)", (req, res) => {
  var deleteDir = `Galleries/${req.params.path}`;
  utility.checkDirExist(req, res, deleteDir);
});

//upload file and save it to local directory
app.post("/gallery/:path(*)", upload.single("image"), (req, res) => {
  if (req.file === undefined) {
    return res.status(400).json({ msg: "Invalid request - file not found" });
  }
  if (req.file.mimetype != "image/jpeg") {
    return res.status(400).json({ msg: "File not of type image/jpeg" });
  }
  const imageNewPath = `Galleries/${req.params.path}/${req.file.originalname}`;
  utility.saveFile(req, res, imageNewPath);
});

module.exports = app;

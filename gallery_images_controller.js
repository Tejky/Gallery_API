const express = require("express");
const app = express.Router();
const fs = require("fs");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const utility = require("./utility.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// lists photos in gallery
app.get("/gallery/:path(*)", (req, res) => {
  var data = {
    path: encodeURI(req.params.path),
    name: req.params.path,
    images: [],
  };
  try {
    fs.accessSync(`${utility.galPath}/${req.params.path}`);
  } catch {
    return res.status(404).json({ msg: "Gallery does not exist" });
  }

  var files = fs.readdirSync(`${utility.galPath}/${req.params.path}`);
  files.forEach((file) => {
    data.images.push({
      path: encodeURI(file),
      fullpath: `${encodeURI(req.params.path)}/${encodeURI(file)}`,
      name: file,
      modified: fs.statSync(`${utility.galPath}/${req.params.path}/${file}`)
        .mtime,
    });
  });
  return res.status(200).json({
    msg: "List of photos in the gallery and information about the gallery",
    gallery: data,
  });
});

//delete photo or gallery
app.delete("/gallery/:path(*)", (req, res) => {
  var deleteDir = `${utility.galPath}/${req.params.path}`;
  utility.checkFileExist(res, deleteDir);
});

//upload file and save it to local directory
app.post("/gallery/:path(*)", upload.single(), (req, res) => {
  if (req.file === undefined) {
    return res.status(400).json({ msg: "Invalid request - file not found" });
  }
  if (req.file.mimetype !== "image/jpeg") {
    return res.status(400).json({ msg: "File not of type image/jpeg" });
  }
  const imageNewPath = `${utility.galPath}/${req.params.path}/${req.file.originalname}`;
  utility.saveFile(req, res, imageNewPath);
});

module.exports = app;

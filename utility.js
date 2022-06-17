const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

var imageData = require("./images.json");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const getModifiedTime = (newPath) => {
  return new Promise((resolve) => {
    fs.stat(newPath, (err, stats) => {
      if (err) {
        console.log(err);
      } else {
        var mtime = stats.mtime;
        return resolve(mtime);
      }
    });
  });
};

const saveFile = async (req, res, newPath) => {
  var image = { uploaded: {} };
  let imageName = path.basename(newPath, path.extname(newPath));
  imageName = `${imageName[0].toUpperCase()}${imageName.substring(1)}`;
  try {
    fs.writeFileSync(newPath, req.file.buffer, (err) => {
      if (err) {
      } else {
        console.log("The file was saved");
      }
    });
    image.uploaded = {
      path: path.basename(newPath),
      fullpath: `${encodeURI(req.params.path)}/${path.basename(newPath)}`,
      name: imageName,
      modified: await getModifiedTime(newPath),
    };
  } catch {
    return res.status(404).json({ msg: "Gallery not found" });
  }
  imageData.galleries.forEach((gallery) => {
    if (gallery.name === req.params.path) {
      if (gallery.images != undefined) {
        gallery.images.push(image.uploaded);
      } else {
        gallery.images = [image.uploaded];
      }
    }
  });
  fs.writeFileSync("images.json", JSON.stringify(imageData), (err) => {
    if (err) {
      return res.status(500).json({ error: "An error has occured" });
    }
  });

  return res.status(201).json({ uploaded: image.uploaded });
};

const deleteFile = (req, res, dirPath) => {
  fs.stat(dirPath, (err, stats) => {
    if (stats.isDirectory()) {
      fs.rmdir(dirPath, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
        return res.status(200).json({ msg: "Gallery was deleted" });
      });
      deleteGalleryJSON(req);
    } else {
      fs.unlink(dirPath, (err) => {
        if (err) {
          throw err;
        }
        return res.status(200).json({ msg: "Photo was deleted" });
      });
      deleteImageJSON(req);
    }
  });
};

const checkDirExist = (req, res, dirPath) => {
  try {
    fs.accessSync(dirPath, () => {});
    deleteFile(req, res, dirPath);
  } catch {
    return res.status(404).json({ msg: "Gallery/photo does not exist" });
  }
};

const deleteGalleryJSON = (req) => {
  const data = imageData.galleries.filter(
    (item) => item.name != req.params.path
  );
  fs.writeFileSync(
    "images.json",
    JSON.stringify({ galleries: data }),
    (err) => {}
  );
};

const deleteImageJSON = (req) => {
  const data = { galleries: [] };
  imageData.galleries.forEach((gallery) => {
    if (gallery.name != path.dirname(req.params.path)) {
      data.galleries.push(gallery);
    } else {
      data.galleries.push({
        name: gallery.name,
        path: gallery.path,
        images: gallery.images.filter(
          (item) => item.fullpath != encodeURI(req.params.path)
        ),
      });
    }
  });
  fs.writeFileSync("images.json", JSON.stringify(data), (err) => {
    if (err) throw err;
  });
};

module.exports.saveFile = saveFile;
module.exports.checkDirExist = checkDirExist;

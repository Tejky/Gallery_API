const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

const galPath = "Galleries";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const getGalleries = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(galPath, async (err, folders) => {
      if (err) {
        reject(new Error(err));
      }
      var promiseArray = [];
      folders.forEach((folder) => {
        promiseArray.push(
          new Promise((resolve, reject) =>
            fs.readdir(`${galPath}/${folder}`, async (err, files) => {
              if (err) {
                reject(err);
              }
              if (files.length !== 0) {
                resolve({
                  path: encodeURI(folder),
                  name: folder,
                  image: {
                    path: encodeURI(files[0]),
                    fullpath: `${encodeURI(folder)}/${encodeURI(files[0])}`,
                    name: files[0],
                    modified: await getModifiedTime(
                      `${galPath}/${folder}/${files[0]}`
                    ),
                  },
                });
              } else {
                resolve({
                  path: encodeURI(folder),
                  name: folder,
                });
              }
            })
          )
        );
      });
      var results = await Promise.all(promiseArray);
      resolve(results);
    });
  });
};

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
  var image = [];
  let imageName = path.basename(newPath, path.extname(newPath));
  imageName = `${imageName[0].toUpperCase()}${imageName.substring(1)}`;
  try {
    fs.writeFileSync(newPath, req.file.buffer, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("The file was saved");
      }
    });
    image.push({
      path: encodeURI(path.basename(newPath)),
      fullpath: `${encodeURI(req.params.path)}/${encodeURI(
        path.basename(newPath)
      )}`,
      name: imageName,
      modified: await getModifiedTime(newPath),
    });
  } catch {
    return res.status(404).json({ msg: "Gallery not found" });
  }
  return res.status(201).json({ uploaded: image });
};

const deleteFile = (res, filePath) => {
  fs.stat(filePath, (err, stats) => {
    if (stats.isDirectory()) {
      fs.rmdir(filePath, { recursive: true }, () => {
        return res.status(200).json({ msg: "Gallery was deleted" });
      });
    } else {
      fs.unlink(filePath, () => {
        return res.status(200).json({ msg: "Photo was deleted" });
      });
    }
  });
};

const checkFileExist = (res, filePath) => {
  try {
    fs.accessSync(filePath);
    deleteFile(res, filePath);
  } catch {
    return res.status(404).json({ msg: "Gallery/photo does not exist" });
  }
};

module.exports.saveFile = saveFile;
module.exports.getGalleries = getGalleries;
module.exports.getModifiedTime = getModifiedTime;
module.exports.checkFileExist = checkFileExist;
module.exports.galPath = galPath;

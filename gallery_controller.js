const express = require("express");
const app = express.Router();
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const ajv = new Ajv();

const imageSchema = require("./gallerySchema.json");
var imageData = require("./images.json");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// lists all galleries
app.get("/gallery", (req, res) => {
  var data = { galleries: [] };
  imageData.galleries.forEach((gallery) => {
    if (
      gallery.images != undefined &&
      gallery.images.find((image) => image.name === gallery.name) != undefined
    ) {
      data.galleries.push({
        path: gallery.path,
        name: gallery.name,
        images: gallery.images.find((image) => image.name === gallery.name),
      });
    } else {
      data.galleries.push({ path: gallery.path, name: gallery.name });
    }
  });
  return res.status(200).json(data);
});

// create new gallery
app.post("/gallery", (req, res) => {
  const validate = ajv.compile(imageSchema);
  const valid = validate(req.body);
  if (!valid || req.body.name.includes("/")) {
    return res.status(400).json({
      msg: "Invalid request. The request doesn't conform to the schema.",
      error: validate.errors,
    });
  }
  if (
    imageData.galleries.find((gallery) => gallery.name === req.body.name) !=
    undefined
  ) {
    return res
      .status(409)
      .json({ msg: "Gallery with this name already exists" });
  }

  let newGallery = {
    path: encodeURIComponent(req.body.name),
    name: req.body.name,
  };
  imageData.galleries.push(newGallery);
  fs.writeFile("images.json", JSON.stringify(imageData), (err) => {
    if (err) {
      return res.status(500).json({ error: "An error has occured" });
    }
  });

  const newDir = `Galleries/${req.body.name}`;
  fs.access(newDir, (err) => {
    if (err) {
      fs.mkdir(newDir, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("New directory creaeted succesfully");
        }
      });
    } else {
      console.log("Given directory already exists");
    }
  });
  return res.status(201).json({ msg: "Gallery was created", newGallery });
});

module.exports = app;

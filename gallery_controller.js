const express = require("express");
const app = express.Router();
const fs = require("fs");
const Ajv = require("ajv");
const ajv = new Ajv();

const imageSchema = require("./gallerySchema.json");

const utility = require("./utility.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// lists all galleries
app.get("/gallery", async (req, res) => {
  var data = { galleries: await utility.getGalleries() };
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

  const newDir = `${utility.galPath}/${req.body.name}`;
  const newDirJson = { path: encodeURI(req.body.name), name: req.body.name };
  fs.access(newDir, (err) => {
    if (err) {
      fs.mkdir(newDir, (err) => {
        if (err) {
          console.log(err);
        } else {
          return res
            .status(201)
            .json({ msg: "Gallery was created", gallery: newDirJson });
        }
      });
    } else {
      return res
        .status(409)
        .json({ msg: "Gallery with this name already exists" });
    }
  });
});

module.exports = app;

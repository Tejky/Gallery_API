const express = require("express");
const app = express();
const fs = require("fs");
const utility = require("./utility.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

fs.mkdir(utility.galPath, () => {});

const gallery = require("./gallery_controller.js");
const gallery_images = require("./gallery_images_controller.js");
const images_output = require("./images_output_controller.js");

app.use("/", gallery);
app.use("/", gallery_images);
app.use("/", images_output);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

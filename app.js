require("dotenv").config();
const express = require("express");
const sharp = require("sharp");
const path = require("path");
const server = express();

/**
 * Add directory path to project path
 * @param {string} p
 * @returns directory path
 */
const withRootPath = (p) => path.join(__dirname, p);

/**
 * Generate image
 * @param {string} file
 * @returns {string} path to image
 */
const generateImage = async (file) => {
  const fileArgs = file.split(".");
  const template = "template/template.jpg";
  const design = `design/${fileArgs[0]}.png`;
  const output = `output/${file}`;
  const details = await sharp(template)
    .composite([{ input: design, gravity: "southeast" }])
    .toFile(output);

  return {
    details,
    output,
  };
};

server.get("/masks/:file", async (req, res) => {
  const file = req.params.file;
  const image = await generateImage(file);

  if (image.details) {
    res.sendFile(withRootPath(image.output));
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening at ${process.env.PORT}`);
});

require("dotenv").config();
const express = require("express");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
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

  if (!fs.existsSync(withRootPath(design)))
    return "Design file does not exists!";

  const output = `output/${file}`;
  const details = await sharp(template)
    .composite([{ input: design }])
    .toFile(output);

  return details;
};

server.get("/", async (req, res) => {
  res.send("<h1>Hello from Simulation File!</h1>");
});

server.get("/autogen/:file", async (req, res) => {
  const file = req.params.file;
  const outputPath = withRootPath(`output/${file}`);

  if (!fs.existsSync(outputPath)) {
    const output = await generateImage(file);
    /**
     * Check if file is generated or not
     * returns message if not generated
     */
    if (typeof output == "string") {
      res.send(output);
      return;
    }
  }

  res.sendFile(outputPath);
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening at ${process.env.PORT}`);
});

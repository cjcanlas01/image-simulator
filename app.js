require("dotenv").config();
const express = require("express");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const server = express();

/**
 * Add directory path to project path
 * @param {string} dir
 * @returns directory path
 */
const withRootPath = (dir) => path.join(__dirname, dir);

/**
 * Generate image
 * @param {string} file
 * @returns {string} path to image
 */
const generateImage = async (file) => {
  const index = file.indexOf("-", file.indexOf("-") + 1);
  let template = file.slice(0, index);
  let design = file.slice(index + 1).replace(".jpg", "");
  const output = `output/${file}`;

  template = `template/${template}.jpg`;
  design = `design/${design}.png`;

  /**
   * Check template and design file first if exists
   */
  if (!fs.existsSync(withRootPath(template)))
    return "Template file does not exists!";
  if (!fs.existsSync(withRootPath(design)))
    return "Design file does not exists!";

  // Generate image
  const details = await sharp(template)
    .composite([{ input: design }])
    .toFile(output);

  return details;
};

server.get("/", async (req, res) => {
  res.send("Hello from template simulation app!");
});

server.get("/autogen/:file", async (req, res) => {
  const file = req.params.file;
  const outputFile = withRootPath(`output/${file}`);

  if (!fs.existsSync(outputFile)) {
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

  res.sendFile(outputFile);
});

server.get("/files/del", (req, res) => {
  const dir = withRootPath("/output/");

  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      /**
       *  Delete all files other than .gitignore
       * .gitignore exists to make output folder read by git
       */
      if (file == ".gitignore") continue;
      fs.unlink(path.join(dir, file), (err) => {
        if (err) throw err;
      });
    }

    res.send("Contents of output folder deleted!");
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening at ${process.env.PORT}`);
});

const fs = require("fs");
const path = require("path");

// Constants
const FILE_NAME = "text";
const filePath = path.resolve(__dirname, `${FILE_NAME}.txt`);

// Async function
async function readFile(path) {
  try {
    const data = await fs.promises.readFile(path, "utf8");
    return data;
  } catch (err) {
    console.log(err);
  }
}

// Run function
readFile(filePath)
  .then((data) => console.log(data))
  .catch((error) => console.log(error));

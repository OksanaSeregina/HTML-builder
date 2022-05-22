const fs = require("fs");
const path = require("path");

const fromPath = path.resolve(__dirname, "styles");
const toPath = path.resolve(__dirname, "project-dist");

function isStyle(dir) {
  if (dir.isDirectory()) {
    return false;
  }
  const ext = path.parse(dir.name).ext;
  return ext.replace(".", "") === "css";
}

async function unlink(dir) {
  fs.unlink(dir, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

async function removeFiles(fullPath) {
  const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
  for (const dir of dirent) {
    const dirPath = fullPath + "\\" + dir.name;
    if (isStyle(dir)) {
      await unlink(dirPath);
    }
  }
}

async function run(fullPath) {
  try {
    const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const dir of dirent) {
      const dirPath = fullPath + "\\" + dir.name;
      if (isStyle(dir)) {
        const readable = fs.createReadStream(dirPath);
        const writable = fs.createWriteStream(toPath + "\\" + "bundle.css", {
          flags: "a",
        });
        readable.pipe(writable);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

(async function () {
  await removeFiles(toPath);
  await run(fromPath);
})();

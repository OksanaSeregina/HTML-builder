const fs = require("fs");
const path = require("path");

const fromPath = path.resolve(__dirname, "files");
const toPath = path.resolve(__dirname, "files-copy");

async function copyFile(from, to) {
  fs.copyFile(from, to, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

async function mkdir(dir) {
  fs.mkdir(dir, { recursive: true }, (error) => {
    if (error) {
      console.error(error);
    }
  });
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
    if (dir.isDirectory()) {
      await removeFiles(dirPath);
    } else {
      await unlink(dirPath);
    }
  }
}

async function fileExists(filename) {
  try {
    await fs.promises.access(filename);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      console.error(error);
    }
  }
}

async function run(fullPath) {
  try {
    await mkdir(fullPath.replace(/files/, "files-copy"));
    const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const dir of dirent) {
      const dirPath = fullPath + "\\" + dir.name;
      if (dir.isDirectory()) {
        await run(dirPath);
      } else {
        await copyFile(dirPath, dirPath.replace(/files/, "files-copy"));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

(async function () {
  const hasCopyPath = await fileExists(toPath);
  if (hasCopyPath) {
    await removeFiles(toPath);
  }
  await run(fromPath);
})();

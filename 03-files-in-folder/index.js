const fs = require("fs");
const path = require("path");

const basePath = path.resolve(__dirname, "secret-folder");

const filePaths = [];

async function readdir(fullPath) {
  try {
    const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const dir of dirent) {
      const dirPath = fullPath + "\\" + dir.name;
      if (dir.isFile()) {
        const stats = await fs.promises.stat(dirPath);
        filePaths.push({ ...path.parse(dirPath), size: stats.size });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

readdir(basePath).then(() => {
  filePaths.forEach(({ name, ext, size }) => {
    console.log(`${name} - ${ext.replace(".", "")} - ${size / 1024}kb`);
  });
});

const fs = require("fs");
const path = require("path");

const srcPath = path.resolve(__dirname);
const distPath = path.resolve(__dirname, "project-dist");
const assetsPath = path.resolve(__dirname, "assets");
const stylePath = path.resolve(__dirname, "styles");
const componentsPath = path.resolve(__dirname, "components");

function isExtension(dir, ext) {
  if (dir.isDirectory()) {
    return false;
  }
  const extension = path.parse(dir.name).ext;
  return extension.replace(".", "") === ext;
}

async function copyFile(from, to) {
  return new Promise(function (resolve, reject) {
    fs.copyFile(from, to, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

async function readFile(dir) {
  return new Promise(function (resolve, reject) {
    fs.readFile(dir, "utf8", function (error, data) {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

async function writeFile(dir, context) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dir, context, "utf8", function (error) {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

async function mkdir(dir) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(dir, { recursive: true }, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

async function unlink(dir) {
  return new Promise(function (resolve, reject) {
    fs.unlink(dir, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
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

async function copyAssets(fullPath) {
  try {
    await mkdir(fullPath.replace(/\\assets/, "\\project-dist\\assets"));
    const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const dir of dirent) {
      const dirPath = fullPath + "\\" + dir.name;
      if (dir.isDirectory()) {
        await copyAssets(dirPath);
      } else {
        await copyFile(
          dirPath,
          dirPath.replace(/\\assets/, "\\project-dist\\assets")
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function createStyles(fullPath, fileName) {
  try {
    const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const dir of dirent) {
      const dirPath = fullPath + "\\" + dir.name;
      if (isExtension(dir, "css")) {
        const readable = fs.createReadStream(dirPath);
        const writable = fs.createWriteStream(distPath + "\\" + fileName, {
          flags: "a",
        });
        readable.pipe(writable);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function getComponentsHtml(fullPath) {
  try {
    const componentsHtml = {};
    const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const dir of dirent) {
      const dirPath = fullPath + "\\" + dir.name;
      if (isExtension(dir, "html")) {
        const html = await readFile(dirPath);
        const key =
          "{{" + dir.name.replace(path.parse(dir.name).ext, "") + "}}";
        componentsHtml[key] = html;
      }
    }
    return componentsHtml;
  } catch (err) {
    console.error(err);
  }
}

async function createHtml(fullPath, srcName, fileName) {
  try {
    const dirent = await fs.promises.readdir(fullPath, { withFileTypes: true });
    for (const dir of dirent) {
      const dirPath = fullPath + "\\" + dir.name;
      if (isExtension(dir, "html") && dir.name === srcName) {
        const source = await getComponentsHtml(componentsPath);
        let html = await readFile(dirPath);

        Object.keys(source).forEach((component) => {
          html = html.replace(component, source[component]);
        });

        await writeFile(distPath + "\\" + fileName, html);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Run
(async function () {
  // NOTE: #1 Create 'project-dist' (if folder doesn't exist) or clear all files (if folder exists)
  const hasDistPath = await fileExists(distPath);
  if (hasDistPath) {
    await removeFiles(distPath); // NOTE: clear all files in 'project-dist'
  } else {
    await mkdir(distPath); // NOTE: create 'project-dist'
  }

  // NOTE: #2 Copy assets as is
  if (fileExists(assetsPath)) {
    await copyAssets(assetsPath);
  }

  // NOTE: #3 Concat .css from styles to style.css and copy to 'project-dist'
  if (fileExists(stylePath)) {
    await createStyles(stylePath, "style.css");
  }

  // NOTE: #4 Create html and copy to 'project-dist'
  await createHtml(srcPath, "template.html", "index.html");
})();

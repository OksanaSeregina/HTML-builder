const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Constants
const FILE_NAME = "text";
const filePath = path.resolve(__dirname, `${FILE_NAME}.txt`);

try {
  // Create streams
  const readable = fs.createReadStream(filePath); // readable stream -> file
  const writable = process.stdout; // writable stream -> console.log

  // Create input and output for readline
  const rl = readline.createInterface({
    input: readable,
    output: writable,
  });

  // Register event on user input
  rl.on("data", (line) => {
    writable.write(line);
  });
} catch (error) {
  // Handle error
  console.error(error.message);
  process.exit();
}

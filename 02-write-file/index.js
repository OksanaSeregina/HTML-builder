const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Constants
const FILE_NAME = "text";
const filePath = path.resolve(__dirname, `${FILE_NAME}.txt`);

try {
  // Welcome message
  console.log("Hi, lets start typing:\n");

  // Create streams
  const readable = process.stdin; // readable stream -> user input
  const writable = fs.createWriteStream(filePath, "utf-8"); // writable stream -> file

  // Create input and output for readline
  const rl = readline.createInterface({
    input: readable,
    output: writable,
  });

  // Register event on user input
  rl.on("line", (line) => {
    if (line.toLowerCase() === "exit".toLowerCase()) {
      return rl.close();
    }
    writable.write(line + "\n");
  });

  // Register event on Ctrl + C
  process.stdin.resume();
  process.on("SIGINT", () => rl.close());

  // Register event on close
  rl.on("close", () => {
    console.log("\nBye-bye");
    writable.close();
    process.exit();
  });
} catch (error) {
  // Handle error
  console.error(error.message);
  process.exit();
}

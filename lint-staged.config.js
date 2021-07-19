const path = require("path");

module.exports = {
  "*.{ts,tsx,js,jsx,json,scss,css,md,html}": (files) => [
    `nx format:write --files=${files
      .map((file) => path.relative(process.cwd(), file))
      .join(",")}`,
  ],
};

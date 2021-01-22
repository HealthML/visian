const path = require("path");

module.exports = {
  "*.{ts,tsx}": (files) => [
    `nx affected:lint --fix --files=${files
      .map((file) => path.relative(process.cwd(), file))
      .join(",")}`,
    `nx format:write --files=${files
      .map((file) => path.relative(process.cwd(), file))
      .join(",")}`,
  ],
  "*.{js,jsx,json,scss,css,md,html}": (files) => [
    `nx format:write --files=${files
      .map((file) => path.relative(process.cwd(), file))
      .join(",")}`,
  ],
};

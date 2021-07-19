/* eslint-disable @typescript-eslint/no-var-requires */
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const baseConfig = require("../../webpack.config");

module.exports = (config) => {
  baseConfig(config);

  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "CNAME"),
          to: "",
        },
      ],
    }),
  );

  return config;
};

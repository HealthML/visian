/* eslint-disable @typescript-eslint/no-var-requires */
const nrwlConfig = require("@nrwl/react/plugins/webpack");

module.exports = (config) => {
  nrwlConfig(config);

  config.module.rules.push({
    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
    use: [
      {
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          outputPath: "fonts/",
        },
      },
    ],
  });

  return config;
};

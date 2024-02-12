/* eslint-disable @typescript-eslint/no-var-requires */
const nrwlConfig = require("@nx/react/plugins/webpack");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = (config) => {
  nrwlConfig(config, {});

  config.module.rules.push(
    {
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
    },
    {
      test: /\.glsl$/i,
      use: "webpack-glsl-loader",
    },
  );

  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "node_modules", "itk", "WebWorkers"),
          to: path.join("itk", "WebWorkers"),
        },
        {
          from: path.join(__dirname, "node_modules", "itk", "ImageIOs"),
          to: path.join("itk", "ImageIOs"),
        },
        /* {
        from: path.join(__dirname, "node_modules", "itk", "PolyDataIOs"),
        to: path.join("PolyDataIOs"),
      },
      {
        from: path.join(__dirname, "node_modules", "itk", "MeshIOs"),
        to: path.join("MeshIOs"),
      }, */
      ],
    }),
  );

  return config;
};

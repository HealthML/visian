const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const { composePlugins, withNx, withWeb } = require("@nx/webpack");
const { withReact } = require("@nx/react");

// Nx composable plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  (config, { options, context }) => {
    config.module.rules.push(
      // The following svg rules are needed to get svgr working with nx,
      // although according to the docs this should be supported out of
      // the box through withReact():
      {
        test: /\.svg$/,
        use: ["file-loader"],
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ["@svgr/webpack"],
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

    config.resolve.fallback = {
      crypto: false,
      stream: false,
    };

    return config;
  },
);

/* eslint-disable @typescript-eslint/no-var-requires */
const nrwlConfig = require("@nrwl/react/plugins/webpack");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = (config) => {
  nrwlConfig(config);

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

  // Required for SharedArrayBuffer so ONNX can use WebAssembly threads:
  config.devServer.headers = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "credentialless",
  };

  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: path.join(
            __dirname,
            "node_modules",
            "onnxruntime-web",
            "dist",
            "ort-wasm*.wasm",
          ),
          to: path.join("[name][ext]"),
        },
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

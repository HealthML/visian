/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const rootWebpackConfig = require("../../../.storybook/webpack.config");

/**
 * Exports a configuration function. Accept the base config as the only param.
 *
 * @param {Parameters<typeof rootWebpackConfig>[0]} options
 */
module.exports = async ({ config: parentConfig, mode }) => {
  const config = await rootWebpackConfig({ config: parentConfig, mode });

  const tsPaths = new TsconfigPathsPlugin({
    configFile: "./tsconfig.base.json",
  });

  if (config.resolve.plugins) {
    config.resolve.plugins.push(tsPaths);
  } else {
    config.resolve.plugins = [tsPaths];
  }

  // Found this here: https://github.com/nrwl/nx/issues/2859
  // And copied the part of the solution that made it work

  const svgRuleIndex = config.module.rules.findIndex((rule) => {
    const { test } = rule;

    return test.toString().startsWith("/\\.(svg|ico");
  });
  config.module.rules[
    svgRuleIndex
  ].test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/;

  config.module.rules.push({
    test: /\.svg$/,
    oneOf: [
      // If coming from JS/TS file, then transform into React component using SVGR.
      {
        issuer: {
          test: /\.[jt]sx?$/,
        },
        use: [
          "@svgr/webpack?-svgo,+titleProp,+ref![path]",
          {
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000, // 10kB
              name: "[name].[hash:7].[ext]",
              esModule: false,
            },
          },
        ],
      },
      // Fallback to plain URL loader.
      {
        use: [
          {
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000, // 10kB
              name: "[name].[hash:7].[ext]",
            },
          },
        ],
      },
    ],
  });

  return config;
};

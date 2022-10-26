/* eslint-disable @typescript-eslint/no-var-requires */
const rootMain = require("../../../.storybook/main");

module.exports = {
  ...rootMain,

  core: { ...rootMain.core, builder: "webpack5" },

  stories: [
    ...rootMain.stories,
    "../src/lib/**/*.stories.mdx",
    "../src/lib/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  // eslint-disable-next-line storybook/no-uninstalled-addons
  addons: [...rootMain.addons, "@nrwl/react/plugins/storybook"],
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      // eslint-disable-next-line no-param-reassign
      config = await rootMain.webpackFinal(config, { configType });
    }

    // add your own webpack tweaks if needed
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

    return config;
  },
};

/* eslint-disable */
export default {
  displayName: "editor",
  preset: "../../jest.preset.js",
  transform: {
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nrwl/react/plugins/jest",
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      { cwd: __dirname, configFile: "./babel-jest.config.json" },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!itk/.*|mobx-utils|three/.*)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleNameMapper: {
    "^worker-loader!.+$": "<rootDir>/__mocks__/worker-mock.ts",
  },
  coverageDirectory: "../../coverage/apps/editor",
};

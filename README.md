# VISIAN

> Concepts for the future of image analysis systems.

## Get Started

1. Install [node.js](https://nodejs.org/en/) and the [yarn](https://yarnpkg.com/en/docs/install) package manager.
2. _Optional: To run application components in a containerized environment (e.g. to test deployment or if you don't want to install local dependencies), you should also install [Docker](https://www.docker.com/)._
3. After cloning the repository, run `yarn` in its root to install all dependencies and set up the git hooks.
4. _Optional: Configure VSCode as described in "Editor Setup" below._

_Note: See "Available Scripts" below for more information._

## Project Structure

This is a monorepo containing multiple libraries (_libs_) and applications (_apps_).

For information about a specific lib or app, please refer to its own README file.

### File Structure

All files should be named in `lower-case-with-dashes.ts`. There is no exception in casing for files holding a component.<br />
TypeScript files (usually `.ts`) using React's JSX syntax should get a `.tsx` file extension.

The contents of this monorepo are structured in the following way:

- `.github/workflows/`: GitHub Actions CI workflows
- `.storybook/`: [Storybook](https://storybook.js.org/) config
- `.vscode/`: [VSCode](https://code.visualstudio.com/) config
- `.yarn/`: [Yarn](https://yarnpkg.com/) config
- `apps/`: Source of the applications in this monorepo
  - `editor/`: The stand-alone editor (default app)
  - `*-demo/`: Various stand-alone demos for testing out new concepts
- `dist/`: Build artifacts (excluded from version control)
- `libs/`: Source of the libraries in this monorepo
  - `rendering/`: WebGL rendering-related code
  - `ui-shared/`: Shared UI code (e.g., the main component library)
  - `utils/`: Shared general-purpose utilities

## Available Scripts

### `yarn start [<app-name>]`

Launches a development server that runs the specified application in development mode.

Omitting an app name starts the default app.

After running this command, the app will be available at the URL printed in the console.<br />
The app will automatically reload if you change any of the source files.

It is possible to use VISIAN with the annotation-service backend. The location of the backend is set via the environment variable `NX_ANNOTATION_SERVICE_HUB_URL`. Assuming the backend is located at `localhost:3000`, you can use the shortcut `yarn start:hub`.

### `yarn format [<app-name>]`

Runs automated code formatting on all applicable file types.

Omitting an app name formats the default app.

### `yarn lint [<app-name>]`

Lints all applicable files and prints the output.

Omitting an app name lints the default app.

### `yarn compile [<app-name>]`

Dry-runs the TypeScript compiler.<br />
This is especially useful to check whether any types or references broke after a big refactoring.

Omitting an app name compiles the default app.

### `yarn test [<app-name>]`

Runs unit tests via [Jest](https://jestjs.io).<br />
Run `yarn affected:test` to execute the unit tests affected by a change.

Tests are automatically discovered from all `*.spec.{ts,tsx}` files.

Omitting an app name tests the default app.

Add the `--codeCoverage` flag to collect coverage.

### `yarn e2e [<app-name>]`

Runs end-to-end tests via [Cypress](https://www.cypress.io).<br />
Run `yarn affected:e2e` to execute the end-to-end tests tests affected by a change.

Omitting an app name tests the default app.

### `yarn storybook`

Launches [Storybook](https://storybook.js.org/).

Stories are automatically added from all `*.stories.{ts,tsx}` files.

### `yarn build [<app-name>] [--prod] [--skip-nx-cache]`

Builds the specified application.<br />
The build artifacts will be stored in the `dist/` directory.

Use the `--prod` flag for a production build.<br />
The `--skip-nx-cache` forces a build even if one is cached in the [Nx Cloud](https://nx.app/).

Omitting an app name builds the default app.

### `yarn graph`

Generates a diagram of the dependencies between the libraries and applications in this monorepo.

## Editor Setup

We recommend using [VSCode](https://code.visualstudio.com/).

After opening the monorepo in VSCode, it will ask you if you want to install recommend extensions. For a seamless development experience, we recommend accepting.

## Project Setup

This project was generated using [Nx](https://nx.dev).

### Adding a new app/lib to your workspace

When generating a new project using `yarn nx g <generator> <project-name>`, a new folder for this project will be generated under either the `apps/` or `libs/` directory. It will contain a basic set up to get up and developing. In accordance with our development tooling, a couple of changes still have to be applied to this basic set up:

1. Add a proper `README.md`. Use the existing ones as orientation.

2. Add the correct parser options to the `.eslintrc.json`:
   In the overrides rule for `"files": ["*.ts", "*.tsx", "*.js", "*.jsx"],`, add:

```
"parserOptions": {
  "project": ["<apps|libs>/<project-name>/tsconfig.*?.json"]
},
```

3. Add the compile target to the `project.json`:
   Between the `lint` and `test` targets, add:

```
"compile": {
  "executor": "@nrwl/workspace:run-commands",
  "options": {
    "commands": [
      {
        "command": "yarn tsc --noEmit --pretty -p <apps|libs>/<project-name>/tsconfig.<app|lib>.json"
      }
    ]
  }
},
```

### Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [React](https://reactjs.org)
  - `npm install --save-dev @nrwl/react`
- Web (no framework frontends)
  - `npm install --save-dev @nrwl/web`
- [Angular](https://angular.io)
  - `npm install --save-dev @nrwl/angular`
- [Nest](https://nestjs.com)
  - `npm install --save-dev @nrwl/nest`
- [Express](https://expressjs.com)
  - `npm install --save-dev @nrwl/express`
- [Node](https://nodejs.org)
  - `npm install --save-dev @nrwl/node`

There are also many [community plugins](https://nx.dev/community) you could add.

### Code scaffolding

Run `nx g @nrwl/react:component my-component --project=my-app` to generate a new component.

### Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

### ☁ Nx Cloud

#### Distributed Computation Caching & Distributed Task Execution

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.

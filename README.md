# VISIAN

> Concepts for the future of image analysis systems.

## Get Started

1. Install [node.js](https://nodejs.org/en/) and the [yarn](https://yarnpkg.com/en/docs/install) package manager.
2. _Optional: To run application components in a containerized environment (e.g. to test deployment or if you don't want to install local dependencies), you should also install [Docker](https://www.docker.com/)._
3. After cloning the repository, run `yarn` in its root to install all dependencies and set up the git hooks.

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
- `apps/`: Source of the applications in this monorepo
  - `api/`: The VISIAN GraphQL API
  - `editor/`: The stand-alone editor (default app)
  - `*-demo/`: Various stand-alone demos for testing out new concepts
- `dist/`: Build artifacts (excluded from version control)
- `libs/`: Source of the libraries in this monorepo
  - `ui-shared/`: Shared UI code (e.g., the main component library)
  - `utils/`: Shared general-purpose utilities

## Available Scripts

### `yarn start [<app-name>]`

Launches a development server that runs the specified application in development mode.

After running this command, navigate to [http://localhost:4200](http://localhost:4200) to view the app in your browser.<br />
The app will automatically reload if you change any of the source files.

Omitting an app name starts the default app.

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

### `yarn dep-graph`

Generates a diagram of the dependencies between the libraries and applications in this monorepo.

## Project Setup

This project was generated using [Nx](https://nx.dev).

It was bootstrapped using the following commands:

```sh
npx create-nx-workspace@latest visian
yarn add -D husky lint-staged

yarn add -D @nrwl/nest
npx nx g @nrwl/nest:app api
yarn add @nestjs/graphql graphql-tools graphql apollo-server-express
yarn add @nestjs/config nestjs-relay
yarn add @nestjs/typeorm typeorm pg
yarn add argon2 express-session connect-typeorm
yarn add -D @types/express-session

yarn add -D @nrwl/react
yarn nx g @nrwl/react:lib ui-shared
yarn add -D @nrwl/storybook @nrwl/cypress cypress
yarn nx g @nrwl/react:storybook-configuration ui-shared --configureCypress --generateStories
yarn remove @storybook/addon-knobs
yarn add -D @storybook/addon-essentials @storybook/addon-a11y
yarn add i18next react-i18next i18next-browser-languagedetector i18next-http-backend moment

yarn nx g @nrwl/react:app editor # using styled-components & react-router
```

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [React](https://reactjs.org)
  - `npm install --save-dev @nrwl/react`
- Web (no-framework front ends)
  - `npm install --save-dev @nrwl/web`
- [Angular](https://angular.io)
  - `npm install --save-dev @nrwl/angular`
- [Nest](https://nestjs.com)
  - `npm install --save-dev @nrwl/nest`
- [Express](https://expressjs.com)
  - `npm install --save-dev @nrwl/express`
- [Node](https://nodejs.org)
  - `npm install --save-dev @nrwl/node`

There are also many [community plugins](https://nx.dev/nx-community) you could add.

## Generate an application

Run `nx g @nrwl/react:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `nx g @nrwl/react:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are sharable across libraries and applications. They can be imported from `@visian/mylib`.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

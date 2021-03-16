# ATIV Seminar: Volumetric Rendering Demonstrator

## Get Started

1. Install [node.js](https://nodejs.org/en/) and the [yarn](https://yarnpkg.com/en/docs/install) package manager.
2. After cloning the repository, run `yarn` in its root to install all dependencies and set up the git hooks.
3. _Optional: Configure VSCode as described in "Editor Setup" below._
4. Start the development server using `yarn start ativ-seminar`. The app will start in your default browser.<br />
   It will reload when you make changes.

## Project Structure

### File Structure

All files should be named in `lower-case-with-dashes.ts`. There is no exception in casing for files holding a component.<br />
TypeScript files (usually `.ts`) using React's JSX syntax should get a `.tsx` file extension.

The app is structured in the following way:

- `src/`: The application's source files
  - `app/`: The app's entry point
  - `components/`: Application-specific React components that do not hook into the application store

## Editor Setup

We recommend using [VSCode](https://code.visualstudio.com/).

After opening the monorepo in VSCode, it will ask you if you want to install recommend extensions. For a seamless development experience, we recommend accepting.

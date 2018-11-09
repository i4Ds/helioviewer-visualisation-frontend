# Helioviewer visualisation frontend
Lightweight frontend for the helioviewer visualisation (timeline)

## Goals
- Easy to use timeline
- Quick navigation to solar events on [helioviewer.org](http://helioviewer.org)
- Timeline can be implemented in helioviwer.org main application

# Getting started
This project uses [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/). Install them, if you have not already done so.
1. Open a terminal, PowerShell, ... and execute `git clone https://github.com/i4Ds/helioviewer-visualisation-frontend.git heliotime`.
1. `cd heliotime`, `npm install` to install all dependencies
2. `npm run start` to start development server with [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/)
3. Open your favourite browser and navigate to [localhost:8082](http://localhost:8082)

# Build and test
## NPM commands
- `npm run start` will start a development server on [localhost:8082](http://localhost:8082) with hot module reloading (reloads complete page for now)
- `npm run build` builds the app for deployment and creates all necessary artifacts in the _dist_ folder
- `npm run lint` starts [ESLint](https://eslint.org/) for linting and [Prettier](https://prettier.io) for clean code
- `npm run lint:fix` tries to automatically fix errors
- `npm run test` exeuctes [Jest tests](http://facebook.github.io/jest/)
- `npm run test:watch` watches for changed files and executes tests on them automatically
- `npm run coverage` to execute Jest coverage

## Tests
Tests shall be placed close to the files that are beeing tested. Create a folder called `__tests__` and place a file `*-test.js` in there, where * is the filename of the tested file.

# Key concepts
- [Sass](http://sass-lang.com) modules
- Testing with [Jest](https://facebook.github.io/jest/)

# Project overview

## Structure
The _app_ directory contains:
- modules: [ES6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) to provide functionality
- components: ES6 modules to provide UI
- modules/\__tests__: Jest test cases
- theme: Sass-Files

## Clean code
- [JSDoc](http://usejsdoc.org/) comments must be included for function and class definitions. Markdown can be used in comments
- Basic rules like text intendation are automatically applied by your editor through the [.editorconfig]
  (http://editorconfig.org) file
- Automatic semicolon insertion (ASI) is enforced in this project
- _iteratable_ objects must have a `,` even after the last element
- Conditional statements must use curly brackets only when it spans multiple lines
- It is disallowed to reassign _function_ parameters
- No redeclaration of variables
- No _with_ statement ([ready why](https://yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/))

# Read
- https://webpack.js.org/
- https://facebook.github.io/jest/

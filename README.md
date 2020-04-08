### bball-slackbot-upgraded

A simple troll bot that sends messages to a specified user on slack when their most hated baseball team wins.

This project started as a simple node script we could run locally, but we wanted to learn how to properly setup AWS Lambdas.

---

### Installation

The root package.json is in the `workspaces` directory, using yarn workspaces

    cd workspaces
    yarn

If you do not have [Serverless](https://serverless.com/) installed, [install it!](https://serverless.com/framework/docs/getting-started/).

---

### Usage

To deploy, run

    serverless deploy

### Random notes

All `serverless` commands can be run with `sls`

The initial setup for this project ran `serverless create` in the root directory, which created and deployed successfully. We decided to use yarn workspaces, and webpack did not automatically handle `node_modules` being outside the workspace where `serverless create ` was run. To fix, the externals line in webpack.config.js is changed from

    externals: [nodeExternals()],

to

    externals: [nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules')
    })],
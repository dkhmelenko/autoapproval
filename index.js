const { run } = require('@probot/adapter-github-actions')
const app = require("./app");

run(app).catch((error) => {
  console.error(error);
  process.exit(1);
});

const { run } = require('@probot/adapter-github-actions')
const app = require("./src/index");

run(app).catch((error) => {
  console.error(error);
  process.exit(1);
});

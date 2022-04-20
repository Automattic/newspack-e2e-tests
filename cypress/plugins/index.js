const fs = require("fs");
const dotenv = require("dotenv");

// On CI, all env. variables will be exported to the ./scripts/.env file.
let envVariables = dotenv.parse(fs.readFileSync("./scripts/.env", "utf8"));

// The ./scripts/.secrets file is for local development.
if (fs.existsSync("./scripts/.secrets")) {
  const localSecrets = dotenv.parse(
    fs.readFileSync("./scripts/.secrets", "utf8")
  );
  envVariables = { ...envVariables, ...localSecrets };
}

const getCompareSnapshotsPlugin = require("cypress-visual-regression/dist/plugin");

module.exports = (on, config) => {
  getCompareSnapshotsPlugin(on, config);

  config.env = { ...config.env, ...envVariables };
  return config;
};

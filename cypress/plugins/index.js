const fs = require("fs");
const dotenv = require("dotenv");

const { NGROK_SUBDOMAIN } = dotenv.parse(
  fs.readFileSync("./scripts/.env", "utf8")
);

const getCompareSnapshotsPlugin = require("cypress-visual-regression/dist/plugin");

module.exports = (on, config) => {
  getCompareSnapshotsPlugin(on);

  config.env.NGROK_SUBDOMAIN = NGROK_SUBDOMAIN;
  return config;
};

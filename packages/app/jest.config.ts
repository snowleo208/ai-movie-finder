const sharedConfiguration = require("@repo/jest-config");

const config = {
  ...sharedConfiguration,
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest-setup-after.ts"],
};

module.exports = config;

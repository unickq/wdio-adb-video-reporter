// Example WebDriverIO configuration with @unickq/wdio-adb-video-reporter
import WdioAdbVideoReporter from "../dist/index.js";

export const config: WebdriverIO.Config = {
  runner: "local",
  specs: ["./test/specs/**/*.ts"],
  exclude: [],
  maxInstances: 1,

  capabilities: [
    {
      platformName: "Android",
      "appium:deviceName": "Android Device",
      "appium:automationName": "UiAutomator2",
      "appium:app": "/path/to/your/app.apk",
    },
  ],

  logLevel: "info",
  bail: 0,
  baseUrl: "http://localhost",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: ["appium"],

  framework: "mocha",

  reporters: [
    "spec",
    // ADB Video Reporter
    [
      WdioAdbVideoReporter,
      {
        outputDir: "./test-videos",
        saveAllVideos: false,
        timestamp: true,
        disabled: false,
      },
    ],
  ],

  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
};

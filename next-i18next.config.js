const path = require("path");

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "kn", "hi"],
    localeDetection: false,
  },
  localePath: path.resolve("./locales"),
};

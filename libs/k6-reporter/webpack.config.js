const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/html-report.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(process.cwd(), "../../utils"),
    libraryTarget: "commonjs",
  },

  plugins: [],

  module: {
    rules: [
      {
        test: /\.ejs/,
        type: "asset/source",
      },
    ],
  },
};

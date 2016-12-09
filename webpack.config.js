const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  entry: [
    "./src/main.jsx",
  ],
  output: {
    filename: "bundle.js",
    path: __dirname + "/build",
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loader: "jsx-loader" },
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") },
    ],
  },
  plugins: [
    new ExtractTextPlugin("bundle.css"),
  ],
  resolve: {
    extensions: ["", ".js", ".jsx"],
  },
}
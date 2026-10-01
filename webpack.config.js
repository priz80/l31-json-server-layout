const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "main.js",
      clean: true,
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? false : "eval-source-map",
    module: {
      rules: [
        {
          test: /\.scss$/i,
          use: [
            isProduction
              ? { loader: MiniCssExtractPlugin.loader, options: { publicPath: "../" } }
              : "style-loader",
            "css-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? "[name].[contenthash].css" : "[name].css",
      }),
      new HtmlWebpackPlugin({
        template: "./index.html",
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
            }
          : false,
      }),
    ],
    devServer: {
      static: "./dist",
      port: 3000,
      open: true,
    },
  };
};

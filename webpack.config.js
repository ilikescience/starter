const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const ExtraWatchWebpackPlugin = require("extra-watch-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const NunjucksWebpackPlugin = require("nunjucks-webpack-plugin");
const WebpackMd5Hash = require("webpack-md5-hash");

const loadNunjucksPlugin = (src, base = "") => {
  const files = fs.readdirSync(src);

  return files.map(file => {
    const ext = path.extname(file);

    if (ext === ".njk") {
      const name = path.basename(file, ext);

      return new NunjucksWebpackPlugin({
        templates: [
          {
            from: `${src}/${file}`,
			to: `${base}${name}.html`,
			context: {contenthash: '[contenthash]'}
          }
        ]
      });
    }
  });
};

module.exports = {
  mode: "development",
  entry: "./src/scripts/index.js",

  output: {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist")
  },

  plugins: [
	new WebpackMd5Hash(),
    new webpack.ProgressPlugin(),
    ...loadNunjucksPlugin("./src/templates/views"),
    new ExtraWatchWebpackPlugin({
      dirs: ["src"]
    }),
    new MiniCssExtractPlugin({
      filename: "main.css"
    })
  ],

  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        include: [path.resolve(__dirname, "src")],
        loader: "babel-loader",

        options: {
          plugins: ["syntax-dynamic-import"],

          presets: [
            [
              "@babel/preset-env",
              {
                modules: false
              }
            ]
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader"
        ]
      }
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: "async",
      minChunks: 1,
      minSize: 30000,
      name: true
    }
  },

  devServer: {
    open: false
  }
};

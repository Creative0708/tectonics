import path from "path";
import webpack from "webpack";
import _ from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  entry: './src/index.ts',
  mode: isProd ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.glsl$/,
        use: {
          loader: "webpack-glsl-minify",
          options: isProd ? {
            // https://github.com/leosingleton/webpack-glsl-minify/issues/64
            nomangle: ["texture"],
            // https://github.com/leosingleton/webpack-glsl-minify/issues/62
            preserveUniforms: true,
          } : {
            preserveDefines: true,
            preserveUniforms: true,
            preserveVariables: true,
            disableMangle: true,
          }
        }
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Tectonics",
      template: "index.html",
    }),
    new MiniCssExtractPlugin(),
  ],
  optimization: {
    minimizer: [
      isProd && new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    watchFiles: [
      "src/**/*",
      "assets/**/*",
      "index.html",
    ],
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
    hot: true,
  },
} satisfies webpack.Configuration;
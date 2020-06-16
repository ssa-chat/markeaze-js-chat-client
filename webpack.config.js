const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackAutoInject = require('webpack-auto-inject-version')
const Dotenv = require('dotenv-webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: './app.js',
  output: {
    filename: 'mkz-chat-client.js'
  },
  plugins: [
    new Dotenv({
      path: './.env',
      safe: true,
      systemvars: true,
      silent: true,
      defaults: false
    }),
    new HtmlWebpackPlugin({
      filename: `index.html`,
      template: './index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: `preview.html`,
      template: './preview.html',
      inject: false
    }),
    new WebpackAutoInject({
      components: {
        AutoIncreaseVersion: false,
        InjectAsComment: false
      }
    })
  ],
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        "style-loader", // creates style nodes from JS strings
        "css-loader", // translates CSS into CommonJS
        "sass-loader" // compiles Sass to CSS, using Node Sass by default
      ]
    },
    {
      test: /\.txt$/,
      use: 'raw-loader'
    },
    {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: {
          condition: /^\**!|@preserve|@license|@cc_on|Copyright|License|LICENSE/i,
          filename(fileData) {
            return `${fileData.filename}.LICENSE`;
          },
          banner(licenseFile) {
            return `License information can be found in https://raw.githubusercontent.com/markeaze/markeaze-js-chat-client/master/dist/${licenseFile}`;
          }
        }
      })
    ]
  },
  devServer: {
    port: 8085
  }
}

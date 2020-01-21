const WebpackAutoInject = require('webpack-auto-inject-version')

module.exports = {
  entry: './app.js',
  output: {
    filename: 'mkz-chat-client.js'
  },
  plugins: [
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
          presets: ['@babel/preset-env']
        }
      }
    }]
  },
  optimization: {
    minimize: true,
    sideEffects: false
  },
  devServer: {
    port: 8085
  }
}

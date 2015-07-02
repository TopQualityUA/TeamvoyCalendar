var path = require("path"),
  webpack = require("webpack"),
  ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: { // The last one in array is exported.
    calendar: ['webpack/hot/dev-server', './src/styles/calendar.scss', "./src/scripts/calendar.js"],
    date_range_picker: ['./src/styles/date_range_picker.scss', "./src/scripts/date_range_picker.js"]
  },
  devServer: {
    contentBase: './',
    noInfo: true, //  --no-info option
    hot: true,
    inline: true
  },
  externals: {
    // require("moment") is external and available
    //  on the global var moment
    "moment": "moment"
  },
  module: {
    loaders:[
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader", 'css-loader!autoprefixer-loader!sass-loader')
      }
    ]
  },
  output: {
    path: path.join(__dirname, "dist/scripts"),
    filename: "[name].js",
    library: ["TeamvoyCalendar", "[name]"],
    libraryTarget: "umd"
  },
  plugins: [
    new ExtractTextPlugin(process.env === 'production' ? "../styles/[name].css" : '[name].css'),
    new webpack.HotModuleReplacementPlugin()
  ]
};

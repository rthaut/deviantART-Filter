var webpack = require("webpack");

module.exports = {
  webpack: (config, { vendor }) => {
    if (["chrome", "opera", "edge"].includes(vendor)) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          browser: "webextension-polyfill",
        }),
      );
    }

    return config;
  },
};

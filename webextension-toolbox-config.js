const path = require('path');
const util = require('util');
const browserslist = require('browserslist');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    'webpack': (config, { dev, vendor }) => {

        // use Webpack Bundle Analyzer when ANALYZE env is truthy
        if (process.env.ANALYZE) {
            config.plugins.push(new BundleAnalyzerPlugin({
                'analyzerMode': dev ? 'server' : 'static',
                'generateStatsFile': dev,
                'openAnalyzer': true,
                'reportFilename': path.resolve('stats', vendor, 'report.html'),
                'statsFilename': path.resolve('stats', vendor, 'stats.json'),
            }));
        }

        // configure @babel/preset-env to use our defined browserslist
        config.module.rules = config.module.rules.map(rule => {
            if (rule.use && rule.use.loader.includes('babel-loader')) {
                rule.use.options.presets[0][1].targets = browserslist().filter(browser => browser.includes(vendor));
            }
            return rule;
        });

        // console.log(util.inspect(config, { 'showHidden': false, 'depth': null }));
        return config;
    },
    'copyIgnore': ['**/*.js', '**/*.json', '**/*.jsx']
};

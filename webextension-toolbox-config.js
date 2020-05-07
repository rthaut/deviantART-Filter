const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    'webpack': (config, { dev, vendor }) => {
        if (process.env.ANALYZE) {
            config.plugins.push(new BundleAnalyzerPlugin({
                'analyzerMode': dev ? 'server' : 'static',
                'generateStatsFile': dev,
                'openAnalyzer': true,
                'reportFilename': path.resolve('stats', vendor, 'report.html'),
                'statsFilename': path.resolve('stats', vendor, 'stats.json'),
            }));
        }
        return config;
    },
    'copyIgnore': [ '**/*.js', '**/*.json', '**/*.jsx' ]
};

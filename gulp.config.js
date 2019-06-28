module.exports = {
    'supported_browsers': {
        'firefox': {
            'protocol': 'moz-extension://'
        },
        'chrome': {
            'protocol': 'chrome-extension://'
        },
        'edge': {
            'protocol': 'ms-browser-extension://'
        }
    },
    'vendor_files': [
        './node_modules/angular/angular-csp.css',
        './node_modules/angular/angular.min.js',
        './node_modules/angular-messages/angular-messages.min.js',
        './node_modules/angular-sanitize/angular-sanitize.min.js',
        './node_modules/bootstrap/dist/css/bootstrap.min.css',
        './node_modules/bootstrap/dist/js/bootstrap.min.js',
        './node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css',
        './node_modules/bootstrap-slider/dist/bootstrap-slider.min.js',
        './node_modules/angular-bootstrap-slider/slider.js',
        './node_modules/idb/build/idb.js',
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/ng-table/bundles/ng-table.min.css',
        './node_modules/ng-table/bundles/ng-table.min.js',
        './node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
    ],
    'plugin_options': {
        'less': {
            'paths': 'node_modules',
            'outputStyle': 'compressed',
            'sourceMap': false
        },
        'uglify': {
            'compress': {
                'drop_console': false,
                'pure_funcs': [
                    'console.group',
                    'console.groupCollapsed',
                    'console.groupEnd',
                    'console.debug',
                    'console.log',
                    'console.info',
                    'console.warning',
                    //'console.error'   // intentionally keeping console.error for troubleshooting release builds
                ]
            },
            'mangle': true
        }
    },
    'source_folders': {
        'locales': './_locales',
        'manifests': './manifests',
        'components': './src/components',
        'helpers': './src/helpers',
        'less': './src/less',
        'pages': './src/pages',
        'scripts': './src/scripts'
    },
    'tokens': {
        'API': {
            'CLIENT_ID': process.env.DEVIANTART_API_CLIENT_ID,
            'CLIENT_SECRET': process.env.DEVIANTART_API_CLIENT_SECRET
        }
    }
};

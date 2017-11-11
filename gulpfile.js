/* global require */
const gulp = require('gulp');

// additional native gulp packages
const del = require('del');
const fs = require('fs');
const path = require('path');
const merge = require('merge-stream');

// load all plugins from package development dependencies
const $ = require('gulp-load-plugins')({
    'scope': ['devDependencies'],
    'pattern': ['*'],
    'rename': {
        'gulp-angular-embed-templates': 'embedTemplates',
        'gulp-if': 'gulpIf',
        'merge-stream': 'stream',
        'rollup-stream': 'rollup',
        'run-sequence': 'sequence',
        'vinyl-buffer': 'buffer',
        'vinyl-source-stream': 'source',
    },
    'postRequireTransforms': {
        'uglify': function (uglify) {
            return uglify = require('gulp-uglify/composer')(require('uglify-es'), console);
        }
    }
});



/* ==================== CONFIGURATION ==================== */

// vendor libraries needed for core functionality
const vendor = [
    './node_modules/angular/angular-csp.css',
    './node_modules/angular/angular.min.js',
    './node_modules/angular-messages/angular-messages.min.js',
    './node_modules/angular-sanitize/angular-sanitize.min.js',
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    //'./node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/ng-table/bundles/ng-table.min.css',
    './node_modules/ng-table/bundles/ng-table.min.js',
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
];

// default options for various plugins
const options = {
    // options for compiling LESS to CSS
    'less': {
        'paths': 'node_modules',
        'outputStyle': 'compressed',
        'sourceMap': false
    },
    'postcss': {
        'plugins': [
            $.cssnano()
        ]
    },
    // options for compressing JS files
    'uglify': {
        'compress': {
            'drop_console': true
        },
        'mangle': true
    }
};

const _folders = {
    'locales': './_locales',
    'components': './lib/components',
    'helpers': './lib/helpers',
    'pages': './lib/pages',
    'scripts': './lib/scripts'
};



/* ==================== HELPER FUNCTIONS ==================== */

/**
 * Get the names of all immediate folders within the supplied directory
 * @param {string} dir - the path to the directory
 * @returns {string[]} - the names of immediate folders within the directory
 */
function folders(dir) {
    return fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
}

/**
 * Prepends the banner (with EJS substitutions from the package) to all files in the stream
 */
const headerTask = $.lazypipe()
    .pipe($.header, fs.readFileSync('./banner.txt', 'utf8'), {
        'package': require('./package.json')
    });

/**
 * Lints all files in the stream
 */
const esLintTask = $.lazypipe()
    .pipe($.eslint, {
        'fix': true
    })
    .pipe($.eslint.format);

/**
 * Processes all CSS files in the stream
 */
const cssTask = $.lazypipe()
    .pipe($.postcss, options.postcss.plugins)
    //$.rename({ suffix: '.min' }),
    .pipe(headerTask);

/**
 * Processes all LESS files in the stream
 */
const lessTask = $.lazypipe()
    .pipe($.less, options.less)
    //$.rename({ suffix: '.min' }),
    .pipe(headerTask);

/**
 * Processes all JS files in the stream
 */
const jsTask = $.lazypipe()
    .pipe($.uglify, options.uglify)
    //$.rename({ suffix: '.min' }),
    .pipe(headerTask);

/**
 * Performs EJS substitutions from the package on a manifest file and ensures it is named correctly
 */
const manifestTask = $.lazypipe()
    .pipe($.ejs, {
        'package': require('./package.json')
    })
    .pipe($.rename, 'manifest.json');



/* ====================  BUILD TASKS  ==================== */

gulp.task('clean', () => {
    return del(['./dist/*'])
        .catch((error) => {
            console.error(error);
        });
});


// ==========================================
// build & lint tasks, broken into components
// ==========================================

gulp.task('lint:components', () => {
    return $.pump([
        gulp.src(path.join(_folders.components, '**/*.js')),
        esLintTask(),
    ]);
});
gulp.task('build:components', ['lint:components'], () => {
    return merge(folders(_folders.components).map((folder) => {
        return $.pump([
            gulp.src(path.join(_folders.components, folder, '**/*.js')),
            $.embedTemplates(),
            $.concat(folder + '.js'),
            jsTask(),
            gulp.dest('./dist/chrome/components'),
            gulp.dest('./dist/firefox/components'),
        ]);
    }));
});


gulp.task('lint:helpers', () => {
    return $.pump([
        gulp.src(path.join(_folders.helpers, '**/*.js')),
        esLintTask(),
    ]);
});


gulp.task('build:images', () => {
    return $.pump([
        gulp.src('./images/**/*.{png,svg}'),
        gulp.dest('./dist/chrome/images'),
        gulp.dest('./dist/firefox/images'),
    ]);
});


gulp.task('build:less', () => {
    return $.pump([
        gulp.src('./lib/less/*.less'),
        lessTask(),
        gulp.dest('./dist/chrome/css'),
        gulp.dest('./dist/firefox/css'),
    ]);
});


gulp.task('build:locales', () => {
    return merge(folders(_folders.locales).map((folder) => {
        return $.pump([
            gulp.src(path.join(_folders.locales, folder, '**/*.json')),
            $.mergeJson({
                'fileName': 'messages.json'
            }),
            gulp.dest(path.join('./dist/firefox/_locales', folder)),
            gulp.dest(path.join('./dist/chrome/_locales', folder)),
        ]);
    }));
});

gulp.task('build:manifest:chrome', () => {
    return $.pump([
        gulp.src(['./manifest.chrome.json']),
        manifestTask(),
        gulp.dest('./dist/chrome'),
    ]);
});
gulp.task('build:manifest:firefox', () => {
    return $.pump([
        gulp.src(['./manifest.firefox.json']),
        manifestTask(),
        gulp.dest('./dist/firefox'),
    ]);
});
gulp.task('build:manifest', ['build:manifest:chrome', 'build:manifest:firefox']);


gulp.task('lint:pages', () => {
    return $.pump([
        gulp.src(path.join(_folders.pages, '**/*.js')),
        esLintTask(),
    ]);
});
gulp.task('build:pages', ['lint:pages'], () => {
    return merge(folders(_folders.pages).map((folder) => {
        return $.pump([
            //TODO: using useref in the build process prevents this entire task from properly ending
            //      so any dependent tasks do not complete properly (like the 'watch' task, which just stops...)
            //gulp.src(path.join(_folders.pages, folder, '**/*.html')),
            //$.useref(),

            gulp.src(path.join(_folders.pages, folder, '**/*.*')),
            $.gulpIf('*.css', cssTask()),
            $.gulpIf('*.js', jsTask()),
            //TODO: maybe use gulp-html-replace to only inject the browser polyfill for Chrome (or remove it for Firefox)?
            //      then the manifest for Firefox can probably omit the polyfill script completely
            gulp.dest(path.join('./dist/chrome/pages', folder)),
            gulp.dest(path.join('./dist/firefox/pages', folder)),
        ]);
    }));
});


gulp.task('lint:scripts', ['lint:helpers'], () => {
    return $.pump([
        gulp.src(path.join(_folders.scripts, '**/*.js')),
        esLintTask(),
    ]);
});
gulp.task('build:scripts', ['lint:scripts'], () => {
    const package = require('./package.json');
    return merge(folders(_folders.scripts).map((folder) => {
        return $.pump([
            $.rollup({
                'input': path.join(_folders.scripts, folder, 'index.js'),
                'format': 'iife',
                'name': package.title.replace(/\s/g, '')
            }),
            $.source(folder + '.js'),
            $.buffer(),
            jsTask(),
            $.tokenReplace({
                'global': $.ini.parse(fs.readFileSync('.config.ini', 'utf-8')),
                'preserveUnknownTokens': true
            }),
            gulp.dest('./dist/chrome/scripts'),
            gulp.dest('./dist/firefox/scripts'),
        ]);
    }));
});


gulp.task('build:vendor', () => {
    return $.pump([
        gulp.src(vendor),
        gulp.dest('./dist/chrome/vendor'),
        gulp.dest('./dist/firefox/vendor'),
    ]);
});


// ========================
// package/distribute tasks
// ========================

gulp.task('zip:chrome', () => {
    const package = require('./package.json');
    return $.pump([
        gulp.src(['./dist/chrome/**/*', '!Thumbs.db']),
        $.zip(package.name + '-chrome.zip'),
        gulp.dest('./dist'),
    ]);
});
gulp.task('zip:firefox', () => {
    const package = require('./package.json');
    return $.pump([
        gulp.src(['./dist/firefox/**/*', '!Thumbs.db']),
        $.zip(package.name + '-firefox.zip'),
        gulp.dest('./dist'),
    ]);
});
gulp.task('zip', ['zip:chrome', 'zip:firefox']);


// =========================
// primary development tasks
// =========================

gulp.task('lint', [
    'lint:components',
    'lint:helpers',
    'lint:pages',
    'lint:scripts',
]);

gulp.task('build', [
    'build:images',
    'build:less',
    'build:locales',
    'build:manifest',
    'build:components',
    'build:pages',
    'build:scripts',
    'build:vendor',
]);

gulp.task('dist', (callback) => {
    $.sequence('clean', 'build', 'zip', callback);
});

gulp.task('watch', ['build'], () => {
    options.uglify.compress.drop_console = false;

    gulp.watch('./manifest.*.json', ['build:manifest']);
    gulp.watch('./images/**/*.{png,svg}', ['build:images']);
    gulp.watch('./lib/less/**/*.less', ['build:less']);
    gulp.watch(path.join(_folders.locales, '/**/*'), ['build:locales']);
    gulp.watch(path.join(_folders.components, '/**/*'), ['build:components']);
    gulp.watch(path.join(_folders.pages, '/**/*'), ['build:pages']);
    gulp.watch([
        path.join(_folders.helpers, '/**/*.js'),
        path.join(_folders.scripts, '/**/*.js'),
    ], ['build:scripts']);
});

// default task (alias build)
gulp.task('default', ['build']);

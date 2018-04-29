/* global require */
const gulp = require('gulp');

const pkg = require('./package.json');

// additional native gulp packages
const del = require('del');
const fs = require('fs');
const path = require('path');
const merge = require('merge-stream');

const print = require('gulp-print').default;

// load all plugins from package development dependencies
const $ = require('gulp-load-plugins')({
    'scope': ['devDependencies'],
    'pattern': ['*'],
    'rename': {
        'gulp-angular-embed-templates': 'embedTemplates',
        'gulp-if': 'gulpIf',
        'rollup-stream': 'rollup',
        'vinyl-buffer': 'buffer',
        'vinyl-source-stream': 'source',
    },
    'postRequireTransforms': {
        'uglify': function (uglify) {
            return uglify = require('gulp-uglify/composer')(require('uglify-es'), console);
        }
    }
});

// TODO: use an array of supported browsers instead of having a hard-coded task for each browser (i.e. 'build:logos:chrome'), then just iterate over that array in a single task to run the logic for each browser in parallel. this might also be useful (or necessary) for tasks that have explicitly output to both browser directories (via 2 dest() invocations)
// TODO: the page build process (or maybe the minify process) should attempt to concatenate all of the linked scripts (ala useref?)
// TODO: all functions should be named to avoid <anonymous> in output - the build functions (after linting) are the problematic ones
// TODO: make the configs separate? (https://github.com/gulpjs/gulp/blob/master/docs/recipes/using-external-config-file.md)


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
    './node_modules/idb/lib/idb.js',
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

// list of directories which have sub-directories that are iterated over during tasks
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
 * Lints all JavaScript files within the supplied directory
 * @param {string} dir - the path to the directory
 * @param {Boolean} [fix=true] - indicates if eslint should attempt to fix errors
 * @param {Boolean} [failOnError=true] - indicates if eslint should fail if there are any unfixed errors
 */
function lint(dir, fix = true, failOnError = true) {
    return $.pump([
        gulp.src(`${dir}/**/*.js`),
        $.eslint({
            'fix': fix
        }),
        $.eslint.format(),
        $.gulpIf(failOnError, $.eslint.failOnError()),
    ]);
}



/* ====================  BUILD TASKS  ==================== */

gulp.task('clean', () => {
    return del(['./dist/*'])
        .catch((error) => {
            console.error(error);
        });
});

gulp.task('minify', () => {
    return $.pump([
        gulp.src(['./dist/**/*.{css,js}', '!./dist/*/vendor/**/*', '!./dist/**/*.min.*', ]),
        $.gulpIf(['**/*.css'], $.postcss(options.postcss.plugins)),
        $.gulpIf(['**/*.js'], $.uglify(options.uglify)),
        // TODO: the filenames SHOULD include .min, but we would need to update the paths in both the HTML files and the manifests
        //$.rename({ 'suffix': '.min' }),
        $.header(fs.readFileSync('./banner.txt', 'utf8'), {
            'pkg': pkg
        }),
        gulp.dest('./dist'),
    ]);
});

// ==========================================
// build & lint tasks, broken into components
// ==========================================

gulp.task('lint:components', () => {
    return lint(_folders.components, true, false);
});
gulp.task('build:components', gulp.series('lint:components', () => {
    return merge(folders(_folders.components).map((folder) => {
        return $.pump([
            gulp.src([`${_folders.components}/${folder}/**/*.js`]),
            $.embedTemplates(),
            $.concat(folder + '.js'),
            gulp.dest('./dist/chrome/components'),
            gulp.dest('./dist/firefox/components'),
        ]);
    }));
}));


gulp.task('lint:helpers', () => {
    return lint(_folders.helpers, true, false);
});


gulp.task('build:images', () => {
    return $.pump([
        gulp.src(['./images/**/*.{png,svg}']),
        gulp.dest('./dist/chrome/images'),
        gulp.dest('./dist/firefox/images'),
    ]);
});


/**
 * Creates multiple resized PNG versions of the SVG logo files
 */
function logoTask(opts) {
    const manifest = require(`./manifest.${opts.browser}.json`);
    const icons = manifest.icons;
    return merge(Object.keys(icons).map((size) => {
        return $.pump([
            gulp.src(['./images/logo/*.svg']),
            $.svg2png({
                'width': size,
                'height': size
            }),
            $.rename(icons[size]),  // the name will include the relative path structure (from the manifest to the icon)
            gulp.dest(`./dist/${opts.browser}`),
        ]);
    }));
}
gulp.task('build:logos:chrome', () => {
    return logoTask({ 'browser': 'chrome' });
});
gulp.task('build:logos:firefox', () => {
    return logoTask({ 'browser': 'firefox' });
});
gulp.task('build:logos', gulp.parallel('build:logos:chrome', 'build:logos:firefox'));


gulp.task('build:less', () => {
    //TODO: handle the moz-extension/chrome-extension URL protocol issue (i.e. the corner background image in content.less)
    return $.pump([
        gulp.src(['./lib/less/*.less']),
        $.less(options.less),
        gulp.dest('./dist/chrome/css'),
        gulp.dest('./dist/firefox/css'),
    ]);
});


gulp.task('build:locales', () => {
    return merge(folders(_folders.locales).map((folder) => {
        return $.pump([
            gulp.src([`${_folders.locales}/${folder}/**/*.json`]),
            $.mergeJson({ 'fileName': 'messages.json' }),
            gulp.dest(`./dist/chrome/_locales/${folder}`),
            gulp.dest(`./dist/firefox/_locales/${folder}`),
        ]);
    }));
});


function manifestTask(opts) {
    return $.pump([
        gulp.src([`./manifest.${opts.browser}.json`]),
        $.ejs({ 'pkg': pkg }),
        $.rename('manifest.json'),
        gulp.dest(`./dist/${opts.browser}`),
    ]);
}
gulp.task('build:manifest:chrome', () => {
    return manifestTask({ 'browser': 'chrome' });
});
gulp.task('build:manifest:firefox', () => {
    return manifestTask({ 'browser': 'firefox' });
});
gulp.task('build:manifest', gulp.parallel('build:manifest:chrome', 'build:manifest:firefox'));


gulp.task('lint:pages', () => {
    return lint(_folders.pages, true, false);
});
gulp.task('build:pages', gulp.series('lint:pages', () => {
    return merge(folders(_folders.pages).map((folder) => {
        return $.pump([
            // TODO: invoking useref prevents this entire task from properly ending, so any dependent tasks do not complete properly (like the 'watch' task, which just stops completely...)
            //gulp.src([`${_folders.pages}/${folder}/**/*.html`]),
            //$.useref(),

            // TODO: if/whe useref works, this line must be removed (useref passes the HTML files and all assets through the stream)
            gulp.src([`${_folders.pages}/${folder}/**/*.*`]),

            // TODO: maybe use gulp-html-replace to only inject the browser polyfill for Chrome (or remove it for Firefox)? then the manifest for Firefox can probably omit the polyfill script completely
            gulp.dest(`./dist/chrome/pages/${folder}`),
            gulp.dest(`./dist/firefox/pages/${folder}`),
        ]);
    }));
}));


gulp.task('lint:scripts', gulp.series('lint:helpers', () => {
    return lint(_folders.scripts, true, false);
}));
gulp.task('build:scripts', gulp.series('lint:scripts', () => {
    const tokens = $.ini.parse(fs.readFileSync('.config.ini', 'utf-8'));
    return merge(folders(_folders.scripts).map((folder) => {
        return $.pump([
            $.rollup({
                'input': `${_folders.scripts}/${folder}/index.js`,
                'format': 'iife',
                'name': pkg.title.replace(/\s/g, ''),
                'external': [
                    'idb'
                ],
                'globals': {
                    'idb': 'idb'
                }
            }),
            $.source(folder + '.js'),
            $.buffer(),
            $.tokenReplace({
                'global': tokens,
                'preserveUnknownTokens': true
            }),
            gulp.dest('./dist/chrome/scripts'),
            gulp.dest('./dist/firefox/scripts'),
        ]);
    }));
}));


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
function zipTask(opts) {
    return $.pump([
        gulp.src([`./dist/${opts.browser}/**/*`, '!Thumbs.db']),
        $.zip(`${pkg.name}-${opts.browser}.zip`),
        gulp.dest('./dist'),
    ]);
}
gulp.task('zip:chrome', () => {
    return zipTask({ 'browser': 'chrome' });
});
gulp.task('zip:firefox', () => {
    return zipTask({ 'browser': 'firefox' });
});
gulp.task('zip', gulp.parallel('zip:chrome', 'zip:firefox'));


// =========================
// primary development tasks
// =========================

gulp.task('lint', gulp.parallel(
    'lint:components',
    'lint:helpers',
    'lint:pages',
    'lint:scripts'
));

gulp.task('build', gulp.parallel(
    'build:images',
    'build:logos',
    'build:less',
    'build:locales',
    'build:manifest',
    'build:components',
    'build:pages',
    'build:scripts',
    'build:vendor'
));

gulp.task('watch', (callback) => {
    // TODO: it would be nice to only rebuild the modified files per watch, but that requires a way to pass them to the build task
    gulp.watch('./manifest.*.json', gulp.task('build:manifest'));
    gulp.watch('./images/**/*.{png,svg}', gulp.task('build:images'));
    gulp.watch('./images/logo/**/*.svg', gulp.task('build:logos'));
    gulp.watch('./lib/less/**/*.less', gulp.task('build:less'));
    gulp.watch(`${_folders.locales}/**/*`, gulp.task('build:locales'));
    gulp.watch(`${_folders.components}/**/*`, gulp.task('build:components'));
    gulp.watch(`${_folders.pages}/**/*`, gulp.task('build:pages'));
    gulp.watch([
        `${_folders.helpers}/**/*.js`,
        `${ _folders.scripts }/**/*.js`,
    ], gulp.task('build:scripts'));

    callback();
});

gulp.task('debug', gulp.series('clean', 'build', 'watch'));
gulp.task('release', gulp.series('clean', gulp.parallel('build'), 'minify', 'zip'));

// default task (alias release)
gulp.task('default', gulp.task('release'));

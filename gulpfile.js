/* global require */
const gulp = require('gulp');
const rollup = require('rollup-stream');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const del = require('del');
const fs = require('fs');
const ini = require('ini');
const path = require('path');
const merge = require('merge-stream');
const sequence = require('run-sequence');

const concat = require('gulp-concat');
const ejs = require('gulp-ejs');
const embedTemplates = require('gulp-angular-embed-templates');
const eslint = require('gulp-eslint');
const folders = require('gulp-folders');
const gulpIf = require('gulp-if');
const header = require('gulp-header');
const less = require('gulp-less');
const mergeJson = require('gulp-merge-json');
const rename = require('gulp-rename');
const tokenReplace = require('gulp-token-replace');

const composer = require('gulp-uglify/composer');
const uglify = composer(require('uglify-es'), console);

const crx = require('gulp-crx-pack');
const zip = require('gulp-zip');



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

// additional includes (custom libraries, classes, etc.)
const includes = [
    //'./lib/jquery.daModal.js',
];

// load in package JSON as object for variables & EJS templates
const package = require('./package.json');

// load in configuration data from INI file
const config = ini.parse(fs.readFileSync('.config.ini', 'utf-8'));

// default options for various plugins
const options = {
    // options for compiling LESS to CSS
    'less': {
        'paths': 'node_modules',
        'outputStyle': 'compressed',
        'sourceMap': false
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



/* ====================  BUILD TASKS  ==================== */

gulp.task('clean', function () {
    return del(['./dist/*'])
        .catch(function (error) {
            console.warn(error);
        });
});


// ==========================================
// build & lint tasks, broken into components
// ==========================================

gulp.task('lint:components', function () {
    return gulp.src(path.join(_folders.components, '**/*.js'))
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format());
});
gulp.task('build:components', ['lint:components'], folders(_folders.components, function (folder) {
    return gulp.src(path.join(_folders.components, folder, '**/*.js'))
        .pipe(embedTemplates())
        .pipe(concat(folder + '.js'))
        .pipe(uglify(options.uglify))
        //.pipe(rename(folder + '.min.js'))
        .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { 'package': package }))
        .pipe(gulp.dest('./dist/components'));
}));


gulp.task('lint:helpers', function () {
    return gulp.src(path.join(_folders.helpers, '**/*.js'))
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format());
});


gulp.task('build:images', function () {
    return gulp.src(['./images/**/*.{png,svg}'])
        .pipe(gulp.dest('./dist/images'));
});


gulp.task('build:includes', function () {
    return gulp.src(includes)
        .pipe(gulp.dest('./dist/includes'));
});


gulp.task('build:less', function () {
    return gulp.src('./lib/less/*.less')
        .pipe(less(options.less))
        //.pipe(rename({ suffix: '.min' }))
        .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { 'package': package }))
        .pipe(gulp.dest('./dist/css'));
});


gulp.task('build:locales', folders(_folders.locales, function (folder) {
    return gulp.src(path.join(_folders.locales, folder, '**/*.json'))
        .pipe(mergeJson({
            'fileName': 'messages.json'
        }))
        .pipe(gulp.dest(path.join('./dist/_locales', folder)));
}));


gulp.task('build:manifest', function () {
    return gulp.src(['./manifest.json'])
        .pipe(ejs({ 'package': package }))
        .pipe(gulp.dest('./dist'));
});


gulp.task('lint:pages', function () {
    return gulp.src(path.join(_folders.pages, '**/*.js'))
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format());
});
gulp.task('build:pages', ['lint:pages'], folders(_folders.pages, function (folder) {
    return merge(
        gulp.src(path.join(_folders.pages, folder, '**/*.html'))
            .pipe(concat(folder + '.html')),
        gulp.src(path.join(_folders.pages, folder, '**/*.css'))
            .pipe(concat(folder + '.css'))
            //.pipe(rename({ suffix: '.min' }))
            .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { 'package': package })),
        gulp.src(path.join(_folders.pages, folder, '**/*.js'))
            .pipe(concat(folder + '.js'))
            .pipe(uglify(options.uglify))
            //.pipe(rename(folder + '.min.js'))
            .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { 'package': package }))
    )
        .pipe(gulp.dest(path.join('./dist/pages', folder)));
}));


gulp.task('lint:scripts', function () {
    return gulp.src(path.join(_folders.scripts, '**/*.js'))
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format());
});
gulp.task('build:scripts', ['lint:helpers', 'lint:scripts'], folders(_folders.scripts, function (folder) {
    return rollup({
        'input': path.join(_folders.scripts, folder, 'index.js'),
        'format': 'iife',
        'name': package.title.replace(' ', ''),
    })
        .pipe(source(folder + '.js'))
        .pipe(buffer())
        .pipe(uglify(options.uglify))
        .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { 'package': package }))
        .pipe(tokenReplace({
            'global': config,
            'preserveUnknownTokens': true
        }))
        .pipe(gulp.dest('./dist/scripts'));
}));


gulp.task('build:vendor', function () {
    return gulp.src(vendor)
        .pipe(gulp.dest('./dist/vendor'));
});


// ========================
// package/distribute tasks
// ========================

gulp.task('zip', function (callback) {
    return gulp.src(['./dist/**/*', '!Thumbs.db'])
        .pipe(zip(package.name + '.zip'))
        .pipe(gulp.dest('./dist'));
});
gulp.task('crx', function () {
    return gulp.src(['./dist', '!Thumbs.db'])
        .pipe(crx({
            'privateKey': fs.readFileSync('./certs/' + package.name + '.pem', 'utf8'),
            'filename': package.name + '.crx'
        }))
        .pipe(gulp.dest('./dist'));
});


// =========================
// primary development tasks
// =========================

gulp.task('lint', function (callback) {
    sequence(
        ['lint:components', 'lint:helpers', 'lint:pages', 'lint:scripts'],
        callback
    );
});

gulp.task('build', ['clean'], function (callback) {
    sequence(
        ['build:images', 'build:less', 'build:locales', 'build:manifest'],
        ['build:components', 'build:includes', 'build:pages', 'build:scripts', 'build:vendor'],
        //['zip', 'crx'],
        callback
    );
});

gulp.task('watch', ['build'], function () {
    options.uglify.compress.drop_console = false;

    gulp.watch(path.join(_folders.components, '/**/*'), ['build:components']);
    gulp.watch('./images/**/*.{png,svg}', ['build:images']);
    gulp.watch(path.join(_folders.helpers, '/**/*'), ['build:scripts']);    // rebuild all scripts that include helpers
    gulp.watch(includes, ['build:includes']);
    gulp.watch('./lib/less/**/*.less', ['build:less']);
    gulp.watch(path.join(_folders.locales, '/**/*'), ['build:locales']);
    gulp.watch('./manifest.json', ['build:manifest']);
    gulp.watch(path.join(_folders.pages, '/**/*'), ['build:pages']);
    gulp.watch('./lib/scripts/**/*.js', ['build:scripts']);
});

// default task (alias build)
gulp.task('default', ['build']);

var gulp = require('gulp');

var del = require('del');
var fs = require('fs');
var sequence = require('run-sequence');

var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var ejs = require("gulp-ejs")
var gulpIf = require('gulp-if');
var header = require('gulp-header');
var insert = require('gulp-insert');
var merge = require('merge-stream');
var replace = require('gulp-replace');
var stripDebug = require('gulp-strip-debug');

var composer = require('gulp-uglify/composer');
var uglify = composer(require('uglify-es'), console);

var crx = require('gulp-crx-pack');
var zip = require('gulp-zip');



/* ==================== CONFIGURATION ==================== */

// set to TRUE to enable console messages in JS output files
const DEBUG = false;

// all scripts directly contributing to the core deviantART Filter functionality
// order is important: base classes > custom filter classes > main class > index.js
var core = [
    './lib/js/classes/base/*.class.js',
    './lib/js/classes/users/*.class.js',
    './lib/js/daFilter.class.js',
    './lib/js/index.js'
];

// additional scripts used by deviantART Filter
var includes = [
    './node_modules/dialog-polyfill/dialog-polyfill.js',
    './node_modules/jquery/dist/jquery.slim.min.js',
    './lib/js/jquery.daModal.js'
];

var utils = [
    './lib/js/scripts/**/*.js'
];

var stylesheets = [
    './lib/css/**/*.css'
];

// load in package JSON as object for variables & EJS templates
var package = require('./package.json');



/* ====================  BUILD TASKS  ==================== */

// tasks for cleaning the build directories
gulp.task('clean:userscript', function () {
    return del(['./dist/userscript/*'])
        .catch(function (error) {
            console.warn(error)
        });
});
gulp.task('clean:webextension', function () {
    return del(['./dist/webextension/*'])
        .catch(function (error) {
            console.warn(error)
        });
});
gulp.task('clean', [
    'clean:userscript',
    'clean:webextension'
]);

// tasks for building the userscript version
gulp.task('build:userscript', function (callback) {
    sequence(
        ['build:userscript:includes', 'build:userscript:utils', 'build:userscript:stylesheets'],
        'build:userscript:core',
        'build:userscript:cleanup',
        callback
    );
});
gulp.task('build:userscript:includes', function () {
    return gulp.src(includes)
        .pipe(concat('includes.js'))
        .pipe(gulpIf('!*.min.js', uglify({ mangle: false })))
        .pipe(gulp.dest('./dist/userscript'));
});
gulp.task('build:userscript:utils', function () {
    return gulp.src(utils)
        .pipe(concat('utils.js'))
        .pipe(gulpIf(!DEBUG, stripDebug()))
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('./dist/userscript'));
});
gulp.task('build:userscript:stylesheets', function () {
    return merge(
        gulp.src(stylesheets)
            .pipe(concat(package.name + '.css'))
            .pipe(replace('\e632', '\\e632'))
            .pipe(cssnano({ zindex: false }))
            .pipe(insert.wrap('(function () { addStyleSheet(\'', '\'); })();')),
        gulp.src('./node_modules/dialog-polyfill/dialog-polyfill.css')
            .pipe(cssnano({ zindex: false }))
            .pipe(insert.wrap('(function () { addStyleSheet(\'', '\'); })();'))
    )
        .pipe(concat('stylesheets.js'))
        .pipe(gulp.dest('./dist/userscript'));
});
gulp.task('build:userscript:core', function () {
    return gulp.src(
        [
            './dist/userscript/includes.js',
            './dist/userscript/utils.js',
            './dist/userscript/stylesheets.js'
        ].concat(core))
        .pipe(gulpIf(!DEBUG, stripDebug()))
        .pipe(uglify({ mangle: false }))
        .pipe(concat(package.name.replace('-', '_') + '.user.js'))
        .pipe(header(fs.readFileSync('./banners/userscript.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/userscript'));
});
gulp.task('build:userscript:cleanup', function () {
    return del([
        './dist/userscript/**/*.js',
        '!./dist/userscript/' + package.name.replace('-', '_') + '.user.js'
    ]);
});

// tasks for building the WebExtension version
gulp.task('build:webextension:js', function () {
    return merge(
        gulp.src(includes)
            .pipe(gulpIf('!*.min.js', uglify({ mangle: false }))),
        gulp.src([].concat(utils, core))
            .pipe(concat(package.name + '.js'))
            .pipe(gulpIf(!DEBUG, stripDebug()))
            .pipe(uglify({ mangle: false }))
            .pipe(header(fs.readFileSync('./banners/webextension.txt', 'utf8'), { package: package }))
    )
        .pipe(gulp.dest('./dist/webextension/js'));
});
gulp.task('build:webextension:css', function () {
    return merge(
        gulp.src(stylesheets)
            .pipe(concat(package.name + '.css'))
            .pipe(cssnano({ zindex: false }))
            .pipe(header(fs.readFileSync('./banners/webextension.txt', 'utf8'), { package: package })),
        gulp.src('./node_modules/dialog-polyfill/dialog-polyfill.css')
            .pipe(cssnano({ zindex: false }))
    )
        .pipe(gulp.dest('./dist/webextension/css'));
});
gulp.task('build:webextension:manifest', function () {
    return gulp.src(['./manifest.json'])
        .pipe(ejs({ package: package }))
        .pipe(gulp.dest('./dist/webextension'));
});
gulp.task('build:webextension:icons', function () {
    return gulp.src(['./resources/icons/**/*.png'])
        .pipe(gulp.dest('./dist/webextension/icons'));
});
gulp.task('build:webextension', function (callback) {
    sequence(
        'clean:webextension',
        ['build:webextension:js', 'build:webextension:css', 'build:webextension:icons', 'build:webextension:manifest'],
        ['zip:webextension', 'crx:webextension'],
        callback
    );
});

// tasks for packaging the WebExtension for distribution
gulp.task('zip:webextension', function (callback) {
    return gulp.src(['./dist/webextension/**/*', '!Thumbs.db'])
        .pipe(zip(package.name + '.zip'))
        .pipe(gulp.dest('./dist'))
});
gulp.task('crx:webextension', function () {
    return gulp.src(['./dist/webextension', '!Thumbs.db'])
        .pipe(crx({
            privateKey: fs.readFileSync('./certs/' + package.name + '.pem', 'utf8'),
            filename: package.name + '.crx'
        }))
        .pipe(gulp.dest('./dist'))
});

// tasks for automatically building on source changes
gulp.task('watch', ['build'], function() {
  gulp.watch('./lib/**/*', ['build']);
});
gulp.task('watch:userscript', ['build:userscript'], function() {
  gulp.watch('./lib/**/*', ['build:userscript']);
});
gulp.task('watch:webextension', ['build:webextension'], function() {
  gulp.watch('./lib/**/*', ['build:webextension']);
});

// task for building everything
gulp.task('build', ['build:userscript', 'build:webextension']);

// default task: cleans and builds everything
gulp.task('default', function (callback) {
    sequence('clean', 'build', callback);
});

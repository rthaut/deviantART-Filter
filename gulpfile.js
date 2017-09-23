const gulp = require('gulp');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

const del = require('del');
const fs = require('fs');
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

const composer = require('gulp-uglify/composer');
const uglify = composer(require('uglify-es'), console);

const crx = require('gulp-crx-pack');
const zip = require('gulp-zip');



/* ==================== CONFIGURATION ==================== */

// set to TRUE to enable console messages in JS output files
let DEBUG = true;

// vendor libraries needed for core functionality
const vendor = [
    './node_modules/angular/angular-csp.css',
    './node_modules/angular/angular.min.js',
    './node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
]

// additional includes (custom libraries, classes, etc.)
const includes = [
    './lib/jquery.daModal.js',
]

// load in package JSON as object for variables & EJS templates
const package = require('./package.json');

// default options for various plugins
const options = {
    // options for compiling LESS to CSS
    less: {
        paths: 'node_modules',
        outputStyle: 'compressed',
        sourceMap: true,
    },
    // options for compressing JS files
    uglify: {
        compress: {
            drop_console: !DEBUG
        },
        mangle: false,
        output: {
            beautify: true,
            bracketize: true
        }
    }
};

const _folders = {
    locales: './_locales',
    components: './lib/components',
    pages: './lib/pages',
    scripts: './lib/scripts'
};



/* ====================  BUILD TASKS  ==================== */

gulp.task('lint', function () {
    return gulp.src('./lib/**/*.js')
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format())
        .on('error', gutil.log)
        //.pipe(eslint.failAfterError());
});

gulp.task('clean', function () {
    return del(['./dist/*'])
        .catch(function (error) {
            console.warn(error)
        });
});

// build tasks, broken into components
gulp.task('build:components', folders(_folders.components, function (folder) {
    return gulp.src(path.join(_folders.components, folder, '**/*.js'))
        .pipe(embedTemplates())
        .pipe(concat(folder + '.js'))
        .pipe(uglify(options.uglify))
        //.pipe(rename(folder + '.min.js'))
        .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/components'));
}));
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
        .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/css'));
});
gulp.task('build:locales', folders(_folders.locales, function (folder) {
    return gulp.src(path.join(_folders.locales, folder, '**/*.json'))
        .pipe(mergeJson({
            fileName: 'messages.json'
        }))
        .pipe(gulp.dest(path.join('./dist/_locales', folder)));
}));
gulp.task('build:manifest', function () {
    return gulp.src(['./manifest.json'])
        .pipe(ejs({ package: package }))
        .pipe(gulp.dest('./dist'));
});
gulp.task('build:pages', folders(_folders.pages, function (folder) {
    return merge(
        gulp.src(path.join(_folders.pages, folder, '**/*.html'))
            .pipe(concat(folder + '.html')),
        gulp.src(path.join(_folders.pages, folder, '**/*.css'))
            .pipe(concat(folder + '.css'))
            //.pipe(rename({ suffix: '.min' }))
            .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package })),
        gulp.src(path.join(_folders.pages, folder, '**/*.js'))
            .pipe(concat(folder + '.js'))
            .pipe(uglify(options.uglify))
            //.pipe(rename(folder + '.min.js'))
            .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package }))
    )
        .pipe(gulp.dest(path.join('./dist/pages', folder)));
}));
gulp.task('build:scripts', folders(_folders.scripts, function (folder) {
    return rollup({
        input: path.join(_folders.scripts, folder, 'index.js'),
        format: 'iife',
        name: package.title.replace(' ', ''),
    })
        .pipe(source(folder + '.js'))
        .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/scripts'));
}));
gulp.task('build:vendor', function () {
    return gulp.src(vendor)
        .pipe(gulp.dest('./dist/vendor'));
});


// tasks for packaging the WebExtension for distribution
gulp.task('zip', function (callback) {
    return gulp.src(['./dist/**/*', '!Thumbs.db'])
        .pipe(zip(package.name + '.zip'))
        .pipe(gulp.dest('./dist'))
});
gulp.task('crx', function () {
    return gulp.src(['./dist', '!Thumbs.db'])
        .pipe(crx({
            privateKey: fs.readFileSync('./certs/' + package.name + '.pem', 'utf8'),
            filename: package.name + '.crx'
        }))
        .pipe(gulp.dest('./dist'))
});

// pimary build task
gulp.task('build', ['clean'], function (callback) {
    sequence(
        ['build:images', 'build:less', 'build:locales', 'build:manifest'],
        ['lint'],
        ['build:components', 'build:includes', 'build:pages', 'build:scripts', 'build:vendor'],
        //['zip', 'crx'],
        callback
    );
});

//primary watch task
gulp.task('watch', ['build'], function () {
    debug = true;
    gulp.watch(path.join(_folders.components, '/**/*'), ['build:components']);
    gulp.watch('./images/**/*.{png,svg}', ['build:images']);
    gulp.watch(includes, ['build:includes']);
    gulp.watch('./lib/less/**/*.less', ['build:less']);
    gulp.watch(path.join(_folders.locales, '/**/*'), ['build:locales']);
    gulp.watch('./manifest.json', ['build:manifest']);
    gulp.watch(path.join(_folders.pages, '/**/*'), ['build:pages']);
    gulp.watch('./lib/scripts/**/*.js', ['build:scripts']);
});

// default task (alias build)
gulp.task('default', ['build']);

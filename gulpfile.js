var gulp = require('gulp');

var del = require('del');
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var sequence = require('run-sequence');

var concat = require('gulp-concat');
var ejs = require('gulp-ejs');
var embedTemplates = require('gulp-angular-embed-templates');
var eslint = require('gulp-eslint');
var folders = require('gulp-folders');
var gulpIf = require('gulp-if');
var header = require('gulp-header');
var less = require('gulp-less');
var mergeJson = require('gulp-merge-json');
var rename = require('gulp-rename');

var composer = require('gulp-uglify/composer');
var uglify = composer(require('uglify-es'), console);

var crx = require('gulp-crx-pack');
var zip = require('gulp-zip');



/* ==================== CONFIGURATION ==================== */

// set to TRUE to enable console messages in JS output files
var DEBUG = true;

// included libraries needed for core functionality
var includes = [
    './node_modules/angular/angular-csp.css',
    './node_modules/angular/angular.min.js',
    './node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    './lib/jquery.daModal.js',
]

// load in package JSON as object for variables & EJS templates
var package = require('./package.json');

// default options for various plugins
var options = {
    // less options
    less: {
        paths: 'node_modules',
        outputStyle: 'compressed',
        sourceMap: true,
    },
    // uglify options for all non-minified JS files
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

var _folders = {
    locales: './_locales',
    components: './lib/components',
    pages: './lib/pages'
};



/* ====================  BUILD TASKS  ==================== */

gulp.task('lint', function () {
    return gulp.src('./lib/**/*.js')
        .pipe(eslint({
            'fix': true
        }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
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
        .pipe(gulpIf(['*.js', '!*.min.js'], uglify(options.uglify)))
        .pipe(rename(folder + '.min.js'))
        .pipe(gulp.dest('./dist/components'));
}));
gulp.task('build:icons', function () {
    return gulp.src(['./icons/**/*.{png,svg}'])
        .pipe(gulp.dest('./dist/icons'));
});
gulp.task('build:includes', function () {
    return gulp.src(includes)
        .pipe(gulpIf(['*.js', '!*.min.js'], uglify(options.uglify)))
        .pipe(gulp.dest('./dist/includes'));
});
gulp.task('build:less', function () {
    return gulp.src('./lib/less/*.less')
        .pipe(less(options.less))
        .pipe(gulpIf(['*.css', '!*.min.css'], rename({ suffix: '.min' })))
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
            .pipe(concat(package.name + '.' + folder + '.html')),
        gulp.src(path.join(_folders.pages, folder, '**/*.css'))
            .pipe(concat(package.name + '.' + folder + '.css'))
            .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package })),
        gulp.src(path.join(_folders.pages, folder, '**/*.js'))
            .pipe(concat(package.name + '.' + folder + '.js'))
            .pipe(uglify(options.uglify))
            .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package }))
    )
        .pipe(gulp.dest(path.join('./dist/pages', folder)));
}));
gulp.task('build:scripts', function () {
    return merge(
        gulp.src('./lib/scripts/background/**/*.js')
            .pipe(concat(package.name + '.background.js')),
        gulp.src('./lib/scripts/content/**/*.js')
            .pipe(concat(package.name + '.content.js'))
    )
        .pipe(gulpIf(['*.js', '!*.min.js'], uglify(options.uglify)))
        .pipe(header(fs.readFileSync('./banner.txt', 'utf8'), { package: package }))
        .pipe(gulp.dest('./dist/scripts'));
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
        ['build:icons', 'build:less', 'build:locales', 'build:manifest'],
        ['lint'],
        ['build:components', 'build:includes', 'build:pages', 'build:scripts'],
        //['zip', 'crx'],
        callback
    );
});

//primary watch task
gulp.task('watch', ['build'], function () {
    debug = true;
    gulp.watch(path.join(_folders.components, '/**/*'), ['build:components']);
    gulp.watch('./icons/**/*.{png,svg}', ['build:icons']);
    gulp.watch('./lib/less/**/*.less', ['build:less']);
    gulp.watch(path.join(_folders.locales, '/**/*'), ['build:locales']);
    gulp.watch('./manifest.json', ['build:manifest']);
    gulp.watch(path.join(_folders.pages, '/**/*'), ['build:pages']);
    gulp.watch('./lib/scripts/**/*.js', ['build:scripts']);
});

// default task (alias build)
gulp.task('default', ['build']);

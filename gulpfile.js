const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
let cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');
livereload = require('gulp-livereload');
const autoprefixer = require('gulp-autoprefixer');
const minify = require('gulp-minify');
const imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
const purgecss = require('gulp-purgecss');
var fixmyjs = require("gulp-fixmyjs");
var browserSync = require('browser-sync').create();
const htmlValidator = require('gulp-w3c-html-validator');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var del = require('del');
var replace = require('gulp-replace');
var rename = require("gulp-rename");
const htmlmin = require('gulp-htmlmin');

appVars = require('./src/library/js/plugins');

// Merge All HTML
gulp.task('fileinclude', async function () {
    gulp.src(['./src/*.html'])
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.reload({stream: true}));
});

// HTML Validator
gulp.task('htmlValidator', async function () {
    gulp.src(['./build/*.html'])
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(htmlValidator())
        // .pipe(htmlValidator.reporter())
        .pipe(browserSync.reload({stream: true}));
});

// Merge ALL JS
gulp.task('scripts', function () {
    return gulp.src(appVars.JS_Library)
        .pipe(concat('app.js'))
        .pipe(minify({
            noSource: true
        }))
        .pipe(gulp.dest('./build/library/js'))
        .pipe(browserSync.reload({stream: true}));
});

// Gulp task to compile SCSS
gulp.task('styles', async function () {
    return gulp.src('./src/library/style/app.scss')
        // Compile SASS files
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        // Auto-prefix css styles for cross browser compatibility
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        // Output
        .pipe(gulp.dest('./build/library/style'))
        .pipe(browserSync.reload({stream: true}));
});

// Gulp task to minify CSS files
gulp.task('minstyles', async function () {
    gulp.src('./src/library/style/app.scss')
        // Compile SASS files
        .pipe(sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        // Auto-prefix css styles for cross browser compatibility
        .pipe(autoprefixer({overrideBrowserslist: ['last 2 versions', 'iOS 8']}))
        // Minify the file
        .pipe(cleanCSS({keepSpecialComments: false}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        // Output
        .pipe(gulp.dest('./build/library/style'));
});

// MINIFY ALL IMAGES
gulp.task('imagemin', async function () {
    gulp.src('src/assets/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(browserSync.reload({stream: true}));

});

// REMOVE UNNECESSARY CSS
gulp.task('purgecss', () => {
    return gulp.src('build/library/style/app.css')
        .pipe(purgecss({
            content: ['build/*.html', 'build/library/js/app-min.js']
        }))
        .pipe(gulp.dest('build/library/style'))
});

// Random string generator
function randomString(length) {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

// File Version Change
gulp.task('VersionChnageTask', async function () {
    let randomstr = "app_v=" + randomString(10);
    await gulp.src("./build/library/js/app-min.js")
        .pipe(rename(randomstr + ".js"))
        .pipe(gulp.dest("./build/library/js"));

    await gulp.src("./build/library/style/app.css")
        .pipe(rename(randomstr + ".css"))
        .pipe(gulp.dest("./build/library/style"));

    await gulp.src(['build/*.html'])
        .pipe(replace('app-min.js', randomstr + ".js"))
        .pipe(replace('app.css', randomstr + ".css"))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('build/'));

    return del([
        'build/library/js/app-min.js',
        'build/library/style/app.css',
    ])
});

// Before Production build clean everything
gulp.task('cleanEverything', async function () {
    return del([
        'build'
    ])
});

// CHECK FILE CHANGES
gulp.task('watch', function () {
    gulp.watch('./src/library/style/app.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.scss', gulp.series('styles'));
    gulp.watch('./src/components/*.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.html', gulp.series('fileinclude'));
    gulp.watch('./src/*.html', gulp.series('fileinclude'));
    gulp.watch('./build/*.html', gulp.series('htmlValidator'));
    gulp.watch('./src/library/js/*.js', gulp.series('scripts'));
    gulp.watch('./src/assets/**/*', gulp.series('imagemin'));
});

// Default Run
gulp.task('run', function () {
    browserSync.init({
        server: {
            baseDir: 'build'
        },
    });
    gulp.watch('./src/library/style/app.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.scss', gulp.series('styles'));
    gulp.watch('./src/components/*.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.html', gulp.series('fileinclude'));
    gulp.watch('./src/*.html', gulp.series('fileinclude'));
    gulp.watch('./build/*.html', gulp.series('htmlValidator'));
    gulp.watch('./src/library/js/*.js', gulp.series('scripts'));
    gulp.watch('./src/assets/*', gulp.series('imagemin'));
    gulp.watch('./src/assets/*/*', gulp.series('imagemin'));
});

// build Task
gulp.task('build', gulp.series('fileinclude', 'htmlValidator', 'styles', 'imagemin', 'scripts'));

// Default Task
gulp.task('default', gulp.series('build', 'run'));

// Production Task
gulp.task('prod', gulp.series('cleanEverything', 'fileinclude', 'htmlValidator', 'minstyles', 'imagemin', 'scripts', 'purgecss', 'VersionChnageTask'));

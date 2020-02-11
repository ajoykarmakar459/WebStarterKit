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

appVars = require('./src/library/js/plugins');


gulp.task('fileinclude', async function () {
    gulp.src(['./src/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./build'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function () {
    return gulp.src(appVars.JS_Library)
        .pipe(concat('app.js'))
        .pipe(minify())
        .pipe(gulp.dest('./build/library/js'))
        .pipe(browserSync.reload({stream: true}));
});

// Gulp task to compile SCSS
gulp.task('styles', async function () {
    return gulp.src('./src/library/style/app.scss')
        // Compile SASS files
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
        // Minify the file
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
        .pipe(autoprefixer())
        // Minify the file
        .pipe(cleanCSS({keepSpecialComments: false}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        // Output
        .pipe(gulp.dest('./build/library/style'));
});

gulp.task('compress', async function () {
    gulp.src(['./src/library/js/*.js'])
        .pipe(minify())
        .pipe(gulp.dest('./build/library/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('imagemin', async function () {
    gulp.src('src/assets/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(browserSync.reload({stream: true}));

});

gulp.task('purgecss', () => {
    return gulp.src('build/library/style/app.css')
        .pipe(purgecss({
            content: ['build/*.html', 'build/library/js/app-min.js']
        }))
        .pipe(gulp.dest('build/library/style'))
});

gulp.task('cleanjs', () => {
    return gulp.src("./build/library/js/app-min.js")
        .pipe(fixmyjs({
            // JSHint settings here
        }))
        .pipe(minify())
        .pipe(gulp.dest('./build/library/js'))
});

gulp.task('watch', function () {
    gulp.watch('./src/library/style/app.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.html', gulp.series('fileinclude'));
    gulp.watch('./src/*.html', gulp.series('fileinclude'));
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
    gulp.watch('./src/components/*/*.html', gulp.series('fileinclude'));
    gulp.watch('./src/*.html', gulp.series('fileinclude'));
    gulp.watch('./src/library/js/*.js', gulp.series('scripts'));
    gulp.watch('./src/assets/*', gulp.series('imagemin'));
});

// Default Task
gulp.task('build', gulp.series('fileinclude', 'styles', 'imagemin', 'scripts', 'watch'));

// Production Task
gulp.task('prod', gulp.series('fileinclude', 'minstyles', 'imagemin', 'scripts', 'purgecss'));

const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
let cleanCSS = require('gulp-clean-css');
// const sass = require('gulp-sass');
var sass = require('gulp-dart-sass');
livereload = require('gulp-livereload');
const autoprefixer = require('gulp-autoprefixer');
const minify = require('gulp-minify');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const purgecss = require('gulp-purgecss');
const fixmyjs = require("gulp-fixmyjs");
const browserSync = require('browser-sync').create();
const validator = require('gulp-html');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const del = require('del');
const replace = require('gulp-replace');
const rename = require("gulp-rename");
const htmlmin = require('gulp-htmlmin');
const shell = require('shelljs');
const os = require('os');

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
        .pipe(validator())
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
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sourcemaps.init())
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
        .pipe(sass().on('error', sass.logError))
        // Auto-prefix css styles for cross browser compatibility
        .pipe(autoprefixer({overrideBrowserslist: ['last 2 versions', 'iOS 8']}))
        // Minify the file
        .pipe(cleanCSS({keepSpecialComments: false}, (details) => {
            // console.log(`${details.name}: ${details.stats.originalSize}`);
            // console.log(`${details.name}: ${details.stats.minifiedSize}`);
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
    let result = '';
    for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
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

// Create folder for developer
gulp.task('devfolder', async function () {
    if (os.platform() === 'darwin') {
        await shell.exec('cp -avr build dev-build')
        await shell.exec('mv dev-build build/')
    } else {
        await shell.exec('xcopy  build dev-build /e /i /h')
        await shell.exec('move dev-build build')
    }
})


// CHECK FILE CHANGES
gulp.task('watch', function () {
    gulp.watch('./src/library/style/*.scss', gulp.series('styles'));
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
    gulp.watch('./src/library/style/*.scss', gulp.series('styles'));
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
gulp.task('prod', gulp.series('cleanEverything', 'fileinclude', 'htmlValidator', 'minstyles', 'imagemin', 'scripts', 'purgecss', 'devfolder', 'VersionChnageTask'));


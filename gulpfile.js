const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
let cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');
livereload = require('gulp-livereload');
const autoprefixer = require('gulp-autoprefixer');
var webserver = require('gulp-webserver');
const minify = require('gulp-minify');
const imagemin = require('gulp-imagemin');

gulp.task('fileinclude', async function () {
    gulp.src(['./src/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./build'));
});

// Gulp task to minify CSS files
gulp.task('styles', function () {
    return gulp.src('./src/library/style/app.scss')
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
        .pipe(cleanCSS({debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        // Output
        .pipe(gulp.dest('./build/library/style'))
});

gulp.task('compress', async function () {
    gulp.src(['./src/library/js/*.js'])
        .pipe(minify())
        .pipe(gulp.dest('./build/library/js'))
});

gulp.task('imagemin', async function () {
    gulp.src('src/assets/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/assets/'))
});

gulp.task('watch', function () {
    gulp.watch('./src/library/style/app.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.scss', gulp.series('styles'));
    gulp.watch('./src/components/*/*.html', gulp.series('fileinclude'));
    gulp.watch('./src/*.html', gulp.series('fileinclude'));
    gulp.watch('./src/library/js/*.js', gulp.series('compress'));
    gulp.watch('./src/assets/*', gulp.series('imagemin'));
});

gulp.task('webserver', function () {
    gulp.src('build')
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            open: true,
            path: 'build/index.html',
            fallback: 'index.html'
        }));
});

// Default Task
gulp.task('build', gulp.series('fileinclude', 'styles', 'imagemin', 'compress', 'watch'));

// Default Run
gulp.task('run', gulp.series('webserver'));

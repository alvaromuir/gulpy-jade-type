/* File: gulpfile.js */

// grab our gulp packages
const os = require('os'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    autoprefixer = require('gulp-autoprefixer'),
    jade = require('gulp-jade'),
    ts = require('gulp-typescript'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    mainBowerFiles = require('main-bower-files'),
    imagemin = require('gulp-imagemin'),
    connect = require('gulp-connect'),
    open = require('gulp-open');


const sassPaths = [
    'bower_components/foundation-sites/scss/',
    'bower_components/motion-ui/',
]

gulp.task('connect', function() {
    connect.server({
        root: 'public',
        port: 3000,
        livereload: true,
    });
});

gulp.task('build-html', function() {
    return gulp.src('source/jade/**/*.jade')
        .pipe(jade({
          pretty: true,
          }
        ))
        .pipe(gulp.dest('public/'))
})

gulp.task('jshint', function() {
    return gulp.src('public/assets/javascript/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('type-script', function () {
    return gulp.src('source/typescript/**/*.ts')
        .pipe(ts({
            noImplicitAny: true
        }))
        .pipe(gulp.dest('public/assets/javascript/'));
});

gulp.task('build-css', function() {
    return gulp.src(['source/scss/**/*.scss',
            '!source/scss/**/*base.scss',
        ])
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: sassPaths,
            errLogToConsole: true,
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/assets/stylesheets'));
});

gulp.task('prefixer', () =>
    gulp.src('public/assets/stylesheets/*.css/')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('public/assets/stylesheets/'))
);

gulp.task('minify-css', function() {
  return gulp.src('public/assets/stylesheets/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/assets/stylesheets'));
});

gulp.task('build-js', function() {
    return gulp.src('source/javascript/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        // run uglify only on '--type production'
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/assets/javascript'));
});

gulp.task('livereload', function() {
    gulp.src('public/**/*')
        .pipe(connect.reload())
});

gulp.task("bower-files", function(){
  return gulp.src(mainBowerFiles())
    .pipe(gulp.dest("public/assets/vendor"))
});

gulp.task('watch', function() {
    gulp.watch('source/jade/**/*.jade', ['build-html']);
    gulp.watch('source/scss/**/*.scss', ['build-css']);
    gulp.watch('public/assets/stylesheets/*.css', ['minify-css']);
    gulp.watch('source/typescript/**/*.ts', ['type-script']);
    gulp.watch('assets/images/**/*.js', ['image-min']);
    gulp.watch('source/javascript/**/*.js', ['jshint']);
    gulp.watch('public/**/*', ['livereload']);
});


gulp.task('image-min', () =>
    gulp.src('assets/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('assets/images'))
);


gulp.task('open', function(){
  gulp.src('./index.html')
  .pipe(open());
});


var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? 'google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));

gulp.src('./package.json').pipe(open({app: 'chrome'}));

gulp.task('browser', function(){
  gulp.src('./second.html')
  .pipe(open({app: browser}));
});


gulp.task('uri', function(){
  gulp.src(__filename)
  .pipe(open({uri: 'localhost:3000'}));
});


gulp.task('app', function(){
  var options = {
    uri: 'http://localhost:3000',
    app: 'google chrome'
  };
  gulp.src(__filename)
  .pipe(open(options));
});


gulp.task('view', ['open', 'uri', 'app', 'browser']);
gulp.task('default', ['connect', 'watch', 'bower-files', 'build-html', 'type-script','jshint', 'build-js', 'build-css', 'minify-css', 'prefixer','image-min']);
gulp.task('serve', ['default','watch', 'connect', 'view'])

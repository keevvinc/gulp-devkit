'use strict';

// Import CommonJS packages
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const wiredep = require('wiredep').stream;
const gulpIf = require('gulp-if');
const useref = require('gulp-useref');
const cache = require('gulp-cache');
const fs = require('fs');

// Error handler
const errorHandler = function(error) {
  notify.onError({
    title: 'Gulp Error',
    message: '<%= error.message %>',
    sound: 'Beep'
  })(error);
  this.emit('end');
};

// Paths
const paths = {
  src: 'app',
  tmp: '.tmp',
  dist: 'dist',
  bower: 'bower_components'
};

// Check if production build
const isProduction = process.env.NODE_ENV === 'production';

// Clean task
gulp.task('clean', function() {
  return gulp.src([paths.tmp, paths.dist], { allowEmpty: true, read: false })
    .pipe(clean());
});

// Styles task
gulp.task('styles', function() {
  return gulp.src(`${paths.src}/styles/**/*.scss`)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [paths.bower],
      quietDeps: true // Suppress deprecation warnings
    }).on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${paths.tmp}/styles`))
    .pipe(browserSync.stream());
});

// Scripts task
gulp.task('scripts', function() {
  return gulp.src(`${paths.src}/scripts/**/*.js`)
    .pipe(plumber({ errorHandler }))
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(gulpIf(isProduction, uglify()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${paths.tmp}/scripts`))
    .pipe(browserSync.stream());
});

// Images task
gulp.task('images', function() {
  return gulp.src(`${paths.src}/images/**/*`)
    .pipe(gulp.dest(`${paths.dist}/images`));
});

// Fonts task
gulp.task('fonts', function() {
  return gulp.src(`${paths.src}/fonts/**/*.{eot,svg,ttf,woff,woff2}`)
    .pipe(gulp.dest(`${paths.dist}/fonts`));
});

// HTML task
gulp.task('html', function() {
  return gulp.src(`${paths.src}/*.html`)
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.stream());
});

// Wiredep task (inject Bower dependencies)
gulp.task('wiredep', function() {
  return gulp.src([
    `${paths.src}/*.html`,
    `${paths.src}/styles/*.scss`
  ], { base: paths.src })
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest(paths.src));
});

// Build HTML task
gulp.task('build-html', function() {
  return gulp.src(`${paths.src}/*.html`)
    .pipe(useref({ searchPath: [paths.tmp, paths.src, paths.bower] }))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest(paths.dist));
});

// Copy CSS task
gulp.task('copy-css', function() {
  return gulp.src(`${paths.tmp}/styles/**/*.css`)
    .pipe(gulp.dest(`${paths.dist}/styles`));
});

// Copy JS task
gulp.task('copy-js', function() {
  return gulp.src(`${paths.tmp}/scripts/**/*.js`)
    .pipe(gulp.dest(`${paths.dist}/scripts`));
});

// Build task
gulp.task('build', gulp.series(
  'clean',
  'wiredep',
  gulp.parallel('styles', 'scripts', 'images', 'fonts'),
  gulp.parallel('build-html', 'copy-css', 'copy-js')
));

// Serve task
gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: [paths.tmp, paths.src, paths.bower],
      routes: {
        '/bower_components': 'bower_components'
      }
    },
    port: 9000,
    notify: false
  });

  // Watch for changes
  gulp.watch(`${paths.src}/styles/**/*.scss`, gulp.series('styles'));
  gulp.watch(`${paths.src}/scripts/**/*.js`, gulp.series('scripts'));
  gulp.watch(`${paths.src}/*.html`, gulp.series('html'));
  gulp.watch([
    `${paths.src}/images/**/*`,
    `${paths.src}/fonts/**/*`
  ]).on('change', browserSync.reload);

  // Watch for bower.json changes
  gulp.watch('bower.json', gulp.series('wiredep'));
});

// Default task
gulp.task('default', gulp.series(
  'clean',
  gulp.parallel('styles', 'scripts', 'html'),
  'serve'
));

// Dev task
gulp.task('dev', gulp.series('default'));

'use strict';
const gulp = require('gulp');
const webpack = require('webpack-stream');
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins();
const imageOptimization = require('gulp-image-optimization');
const path = require('path');
gulp.task('webpack:dev', () => {
  return gulp.src(path.join(__dirname, 'app', 'js', 'client.js'), { read: true })
    .pipe(webpack({
      output: {
        filename: 'bundle.min.js'
      }
    }))
    .pipe(plugins.concat('bundle.min.js'))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build', 'js')));
});
gulp.task('html:dev', () => {
  return gulp.src(path.join(__dirname, 'app', '**', '*.html'))
    .pipe(plugins.htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build')));
});
gulp.task('css:dev', () => {
  var processors = [
    require('cssnext'),
    require('postcss-font-family'),
    require('postcss-font-magician'),
    require('autoprefixer'),
    require('css-mqpacker'),
    require('csswring'),
    require('colorguard')
  ];
  return gulp.src(path.join(__dirname, 'app', 'css', '**', '*.scss'))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.cssnano())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build', 'css')));
});
gulp.task('fonts:dev', () => {
  return gulp.src(path.join(__dirname, 'app', 'css', 'fonts', '**', '*'))
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build', 'css', 'fonts')));
});
gulp.task('images:dev', function() {
  return gulp.src(path.join(__dirname, 'app', 'images', '*'))
    .pipe(imageOptimization({
      optimizationLevel: 7,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build', 'images')));
});
gulp.task('content:dev' () => {
  return gulp.src(path.join(__dirname, 'app', 'content', '*'))
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build', 'content')));
});
gulp.task('build:dev', [
  'webpack:dev',
  'html:dev',
  'fonts:dev',
  'css:dev',
  'images:dev',
  'content:dev'
]);
gulp.task('default', ['build:dev']);

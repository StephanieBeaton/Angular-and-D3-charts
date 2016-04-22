'use strict';
const gulp = require('gulp');
const webpack = require('webpack-stream');
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins();
const imageOptimization = require('gulp-image-optimization');
const path = require('path');

const paths = {
  js: path.join(__dirname, 'app', 'js', '**', '*.js'),
  html: path.join(__dirname, 'app', '**', '*.html'),
  css: path.join(__dirname, 'app', 'css', '**', '*.scss'),
  fonts: path.join(__dirname, 'app', 'css', 'fonts', '**', '*'),
  images: path.join(__dirname, 'app', 'images', '*'),
  data: path.join(__dirname, 'app', 'data', '*')
}

gulp.task('webpack:dev', () => {
  return gulp.src(path.join(__dirname, 'app', 'js', 'client.js'), { read: true })
    .pipe(webpack({ output: { filename: 'bundle.min.js' } }))
    .pipe(plugins.concat('bundle.min.js'))
    //.pipe(plugins.uglify())
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
    require('csswring')
  ];
  return gulp.src(path.join(__dirname, 'app', 'css', '**', '*.scss'))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.postcss(processors))
    .pipe(plugins.uncss({ html: [path.join(__dirname, 'app', 'index.html'), path.join(__dirname, 'app', 'templates', '*.html')] }))
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
    .pipe(imageOptimization({ optimizationLevel: 7, progressive: true, interlaced: true }))
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build', 'images')));
});
gulp.task('data:dev', () => {
  return gulp.src(path.join(__dirname, 'app', 'data', '*'))
    .pipe(gulp.dest(path.join(__dirname, '..', 'server', 'build', 'data')));
});

gulp.task('watch:css', () => {
  gulp.watch(paths.css, ['css:dev'])
});
gulp.task('watch:html', () => {
  gulp.watch(paths.html, ['html:dev'])
});
gulp.task('watch:js', () => {
  gulp.watch(paths.js, ['webpack:dev'])
});
gulp.task('watch:fonts', () => {
  gulp.watch(paths.fonts, ['fonts:dev'])
});
gulp.task('watch:images', () => {
  gulp.watch(paths.images, ['images:dev'])
});
gulp.task('watch:data', () => {
  gulp.watch(paths.data, ['data:dev'])
});

gulp.task('watch:all', ['watch:css', 'watch:html', 'watch:js', 'watch:fonts', 'watch:images', 'watch:data'])
gulp.task('build:dev', ['webpack:dev', 'html:dev', 'fonts:dev', 'css:dev', 'data:dev', 'images:dev']);
gulp.task('default', ['build:dev', 'watch:all']);

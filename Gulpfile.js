var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch');

gulp.task('watch', function() {
  watch('lib/**/*', function() {
    gulp.start('browserify');
  });
  watch('reference/js/viewer.js', function() {
    gulp.start('browserify');
  });
});

gulp.task('build', function() {
  gulp.src('lib/quickCadence.js')
      .pipe(browserify({
      }))
      .pipe(rename('quickCadence.all.js'))
      .pipe(gulp.dest('build'));
});

gulp.task('browserify', function() {
  gulp.src('reference/js/viewer.js')
      .pipe(browserify({
        insertGlobals: true,
        transform: ['brfs']
      }))
      .pipe(rename('main.js'))
      .pipe(gulp.dest('reference/js'))
});

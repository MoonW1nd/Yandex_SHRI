'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
// const babel = require('gulp-babel');

gulp.task('styles', function () {
	return gulp.src('./dev/styles/main.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest('./public/css'));
});

gulp.task('assets', function() {
	return gulp.src(['dev/assets/**'])
		.pipe(newer('public/assets'))
		.pipe(gulp.dest('public/assets'));
});

gulp.task('html', function() {
	return gulp.src(['dev/*.html'])
		.pipe(newer('public'))
		.pipe(gulp.dest('public'));
});

gulp.task('js', function() {
	return gulp.src(['dev/js/*.js'])
		.pipe(newer('public/js'))
		.pipe(gulp.dest('public/js'));
});

gulp.task('serve', function () {
    browserSync.init({
        server: 'public'
    });
    browserSync.watch('public/*.*').on('change', browserSync.reload);
});

gulp.task('watch', function() {
	gulp.watch('dev/styles/**/*.*', ['styles']).on('change', browserSync.reload);
	gulp.watch('dev/assets/*.*', ['assets']).on('change', browserSync.reload);
	gulp.watch('dev/js/*.js', ['js']).on('change', browserSync.reload);
	gulp.watch('dev/*.html', ['html']).on('change', browserSync.reload);
});

gulp.task('build', ['styles', 'html', 'assets', 'js', 'watch','serve']);
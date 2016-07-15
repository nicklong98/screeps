"use strict";

var gulp = require('gulp');
var tsproject = require( 'tsproject' );
var https = require('https');
var fs = require('fs');
var secrets = require('./secrets.js');

gulp.task('compile', function () {
    return tsproject.src( './tsconfig.json')
        .pipe(gulp.dest('../simulation'));
});

gulp.task('upload-sim', ['compile'], function () {
	gulp.src('../simulation/src/*').pipe(gulp.dest('../simulation'));
});

gulp.task('watch', function() {
    gulp.watch('./src/**/*.ts', ['build']);
});

gulp.task('build', ['upload-sim']);

gulp.task('default',['watch']);

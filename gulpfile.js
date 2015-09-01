var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    jeditor = require("gulp-json-editor"),
    insert = require('gulp-insert'),
    rename = require('gulp-rename'),
    merge = require('merge-stream');

var projectSettings = {
    name: 'lski-request',
    version: "1.1.1",
    homepage: 'https://github.com/lski/lski-requestjs',
    description: "A Promise based ajax request helper",
    "author": "Lee Cooper <lee.cooper@lski.uk>",
    "keywords": [
        "Promise",
        "ajax",
        "request"
    ],
    "license": "MIT",
    "main": "dist/lski-request.js",
};

var packageOnlySettings = {
    "repository": {
        "url": "https://github.com/lski/lski-requestjs.git"
    }
};
    
gulp.task('clean', function() {
    
    return del('dist');
});

gulp.task('settings', function() {

    var pkg = gulp.src("./package.json")
        .pipe(jeditor(projectSettings))
        .pipe(jeditor(packageOnlySettings))
        .pipe(gulp.dest('./'));
    
    var bwr = gulp.src("./bower.json")
        .pipe(jeditor(projectSettings))
        .pipe(gulp.dest('./'));
    
    return merge(pkg, bwr);
});

gulp.task('dist', ['clean'], function() {

    return gulp.src('src/*.js')
        .pipe(concat(projectSettings.name + '.debug.js'))
        .pipe(insert.prepend('/*! ' + projectSettings.name + ' - ' + projectSettings.version + ' */\n'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-dist', ['dist'], function () {

    return gulp.src('dist/*.js')
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(rename(function(path) {
            path.basename = path.basename.replace(/\.[^.]*/, '');
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['settings', 'minify-dist']);
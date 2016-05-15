var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    jeditor = require("gulp-json-editor"),
    insert = require('gulp-insert'),
    rename = require('gulp-rename'),
    merge = require('merge-stream'),
    clone = require('gulp-clone'),
    settings = require("./package.json"),
    TestServer = require('karma').Server;

gulp.task('clean', function () {

    return del('dist');
});

gulp.task('settings', function () {

    return gulp.src("./bower.json")
        .pipe(jeditor({
            "homepage": settings.homepage,
            "description": settings.description,
            "author": settings.author,
            "keywords": settings.keywords,
            "main": settings.main
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('dist', ['clean'], function () {

    var debug = gulp.src('src/*.js')
        .pipe(concat(settings.name + '.debug.js'))
        .pipe(insert.prepend('/*! ' + settings.name + ' - ' + settings.version + ' */\n'));
        

    var min = debug.pipe(clone())
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace(/\.[^.]*/, '');
        }));
        
        return merge(debug, min)
            .pipe(gulp.dest('dist'));
});

gulp.task('default', ['settings', 'dist']);

/**
 * Run Jasmine tests in Karma
 */
gulp.task('test', function (done) {

    new TestServer({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done).start();

});
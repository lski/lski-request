module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        reporters: ['spec'],
        plugins: ['karma-spec-reporter', 'karma-jasmine', 'karma-phantomjs-launcher'],
        browsers: ['PhantomJS'],
        files: [
            '../node_modules/es6-promise/dist/es6-promise.min.js',
            '../src/lski-request.js',
            'specs/**/*.js'
        ]
    });
};
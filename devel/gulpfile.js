"use strict";

var gulp = require('gulp');
var gulpJade = require('gulp-jade');
var browserSync = require('browser-sync').create();
var del = require('del');
var runSequence = require('run-sequence');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var debug = require('gulp-debug');
var path = require('path');
// var gutil = require('gulp-util');
var sass = require('gulp-sass');
var fs = require('fs');
var concat = require('gulp-concat');


var myPath = {
    buildDir: '../build',
    headFile: 'app/_head.jade'
};
var levelSortLib = {
    'angular.': 10,
    'jquery': 11,
    'firebase': 12,
    '$other': 19,
    'Main': 20
};


gulp.task('default', ['watch']);

gulp.task('build', function (callback) {
    runSequence('clean', ['sass', 'jslib', 'jsconf'], 'head', 'jade', callback);
});

gulp.task('build-dev', function (callback) {
    runSequence('build', 'browserSync', callback);
});

gulp.task('browserSync', function () {
    browserSync.open=false;
    browserSync.init({
        server: {
            baseDir: myPath.buildDir
        }
    });

    // browserSync.watch('app/**/*.*').on('change',browserSync.reload)
});

gulp.task('jade', function () {
    return gulp.src(['app/**/*.jade', '!app/**/_*.jade'])
        .pipe(debug({title: 'jade files'}))
        .pipe(gulpJade({
            pretty: true
        }))
        .pipe(gulp.dest(myPath.buildDir))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('jslib', function () {
    return gulp.src(['app/js/**/*.js', '!app/js/Main.js'], {base: 'app'})
        .pipe(cached('jslib'))
        .pipe(debug({title: 'jslib files'}))
        .pipe(gulp.dest(myPath.buildDir))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('jsconf', function () {
    return gulp.src(['app/js/Main.js', 'app/view/**/*.js'])
        .pipe(cached('jsconf'))
        .pipe(debug({title: 'jsconf files'}))
        .pipe(remember('jsconf'))
        .pipe(concat('Main.js'))
        .pipe(gulp.dest(myPath.buildDir + '/js'))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task('sass', function () {
    return gulp.src('app/scss/bootstrap-sass-3.3.6/styles.sass')
        // .pipe(cached('sass'))
        .pipe(debug({title: 'sass files'}))
        .pipe(sass())
        .pipe(gulp.dest(myPath.buildDir + '/css'))
        .pipe(browserSync.reload({
            stream: true
        }));

});

// gulp.task('media', function () {
//
//     return gulp.src('app/media/**',{base:'app'})
//     // .pipe(newer(myPath.buildDir))
//         .pipe(cached('media'))
//         .pipe(debug({title: 'media files'}))
//         .pipe(gulp.dest(myPath.buildDir))
//         .pipe(browserSync.reload({
//             stream: true
//         }));
// });

gulp.task('clean', function () {
    return del([myPath.buildDir, myPath.headFile], {force: true});
});

gulp.task('head', function () {
    var buf = [];
    return gulp.src([myPath.buildDir + '/{**/*.css,js/**/*.js}',
            '!' + myPath.buildDir + '/js/lib/bootstrap-sass-3.3.6/**/!(bootstrap.min.js)'],
        {base: myPath.buildDir, read: false, dot: true})

        .on('data', function (file) {

            var tmp = path.relative(path.resolve(myPath.buildDir), file.path);
            switch (path.extname(file.path)) {
                case '.css':
                    buf.push("link(href='" + tmp + "', rel='stylesheet')\n");

                    break;
                case '.js':
                    buf.push("script(src='" + tmp + "')\n");
                    break;
            }

        })
        .on('end', function () {
            var keys = Object.keys(levelSortLib);
            buf.sort(function (a, b) {
                var keyA,
                    keyB;
                keys.forEach(function (itemKeys) {
                    if (a.indexOf(itemKeys) > -1) keyA = itemKeys;
                    if (b.indexOf(itemKeys) > -1) keyB = itemKeys;
                });
                if (keyA === undefined) keyA = '$other';
                if (keyB === undefined) keyB = '$other';

                return levelSortLib[keyA] - levelSortLib[keyB];
            });

                fs.appendFile(myPath.headFile, buf.join('\n'), function (err) {
                });
        })
        .pipe(debug({title: 'build head'}))
});


//===============================WATCH===================================================


gulp.task('watch', ['build-dev'], function () {
    gulp.watch('app/**/*.jade', ['jade']).on('change', function (event) {
        var filepathSrc, filepathDest, tmp,
            func = function () {
                del.sync(filepathDest, {force: true});
            };
        switch (event.type) {
            case 'deleted': // if a file is deleted, forget about it
                filepathSrc = path.resolve(event.path);
                tmp = path.relative('app', event.path);
                tmp = path.dirname(tmp) + path.sep + path.basename(tmp, path.extname(tmp)) + '.html';
                filepathDest = path.resolve(myPath.buildDir, tmp);
                func();
                break;
            case  'renamed':
                filepathSrc = path.resolve(event.old);
                tmp = path.relative('app', event.old);
                tmp = path.dirname(tmp) + path.sep + path.basename(tmp, path.extname(tmp)) + '.html';
                filepathDest = path.resolve(myPath.buildDir, tmp);
                func();
                break;
        }
    });

    gulp.watch(['app/**/*.scss','app/**/*.sass'], ['sass']).on('change', function (event) {
        var filepathSrc, filepathDest, tmp,
            func = function () {
                // delete cached.caches['sass'][filepathSrc];
                del.sync([filepathDest, myPath.buildDir], {force: true});
                gulp.run('head');
            };
        switch (event.type) {
            case 'deleted': // if a file is deleted, forget about it
                filepathSrc = path.resolve(event.path);
                tmp = path.relative('app', event.path);
                tmp = path.dirname(tmp) + path.sep + path.basename(tmp, path.extname(tmp)) + '.css';
                filepathDest = path.resolve(myPath.buildDir, tmp);
                func();
                break;
            case  'renamed':
                filepathSrc = path.resolve(event.old);
                tmp = path.relative('app', event.old);
                tmp = path.dirname(tmp) + path.sep + path.basename(tmp, path.extname(tmp)) + '.css';
                filepathDest = path.resolve(myPath.buildDir, tmp);
                func();
                break;
        }
    });

    // gulp.watch('app/{media,fonts}/**', ['media']).on('change', function (event) {
    //     var filepathSrc, filepathDest,
    //         func = function () {
    //             delete cached.caches['media'][filepathSrc];
    //             del.sync(filepathDest, {force: true});
    //         };
    //     switch (event.type) {
    //         case 'deleted': // if a file is deleted, forget about it
    //             filepathSrc = path.resolve(event.path);
    //             filepathDest = path.resolve(myPath.buildDir, path.relative('app', event.path));
    //             func();
    //             break;
    //         case  'renamed':
    //             filepathSrc = path.resolve(event.old);
    //             filepathDest = path.resolve(myPath.buildDir, path.relative('app', event.old));
    //             func();
    //             break;
    //     }
    // });

    gulp.watch(['app/js/**/*.js', '!app/js/Main.js'], ['jslib']).on('change', function (event) {
        var filepathSrc, filepathDest,
            func = function () {
                delete cached.caches['jslib'][filepathSrc];
                del.sync([filepathDest, myPath.headFile], {force: true});
                gulp.run('head');
            };
        switch (event.type) {
            case 'deleted': // if a file is deleted, forget about it
                filepathSrc = path.resolve(event.path);
                filepathDest = path.resolve(myPath.buildDir, path.relative('app', event.path));
                func();
                break;
            case  'renamed':
                filepathSrc = path.resolve(event.old);
                filepathDest = path.resolve(myPath.buildDir, path.relative('app', event.old));
                func();
                break;
        }
    });

    gulp.watch(['app/js/Main.js', 'app/view/**/*.js'], ['jsconf']).on('change', function (event) {
        var filepathSrc, filepathDest,
            func = function () {
                delete cached.caches['jsconf'][filepathSrc];
                remember.forget('jsconf', filepathSrc);
                del.sync([filepathDest, myPath.headFile], {force: true});
                gulp.run('head');
            };
        switch (event.type) {
            case 'deleted': // if a file is deleted, forget about it
                filepathSrc = path.resolve(event.path);
                filepathDest = path.resolve(myPath.buildDir, path.relative('app', event.path));
                func();
                break;
            case  'renamed':
                filepathSrc = path.resolve(event.old);
                filepathDest = path.resolve(myPath.buildDir, path.relative('app', event.old));
                func();
                break;
        }
    });
});
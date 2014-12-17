var gulp = require("gulp");
var amdOptimize = require("amd-optimize");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

path = {
    html: ['demo/**/*.html'],
    scripts: ['app/**/*.js'],
    scss: ['app/**/*.scss', '!app/library/vendor/**/*.scss'],
    less: ['app/**/*.less', '!app/library/**/*.less'],
    css: 'app/**/*/documentation/**/*.css',
    images: 'app/**/*.png'
};


gulp.task("scripts:calendar", function () {

    return gulp.src("src/scripts/**/*.js")
        // Traces all modules and outputs them in the correct order.
        .pipe(amdOptimize("calendar", {
            paths: {
                "moment": "empty:",
                "event_machine": "library/event_machine"
            }
        }))
        .pipe(concat("calendar.js"))
        .pipe(gulp.dest("dist/scripts"));

});

gulp.task("scripts:dateRangePicker", function () {

    return gulp.src("src/scripts/**/*.js")
        // Traces all modules and outputs them in the correct order.
        .pipe(amdOptimize("date_range_picker", {
            paths: {
                "moment": "empty:",
                "event_machine": "library/event_machine"
            }
        }))
        .pipe(concat("date_range_picker.js"))
        .pipe(gulp.dest("dist/scripts"));

});

gulp.task("scripts:calendarMin", function () {

    return gulp.src("src/scripts/**/*.js")
        // Traces all modules and outputs them in the correct order.
        .pipe(amdOptimize("calendar", {
            paths: {
                "moment": "empty:",
                "event_machine": "library/event_machine"
            }
        }))
        .pipe(concat("calendar_min.js"))
        .pipe(uglify("calendar_min.js"))
        .pipe(gulp.dest("dist/scripts"));

});

gulp.task("scripts:dateRangePickerMin", function () {

    return gulp.src("src/scripts/**/*.js")
        // Traces all modules and outputs them in the correct order.
        .pipe(amdOptimize("date_range_picker", {
            paths: {
                "moment": "empty:",
                "event_machine": "library/event_machine"
            }
        }))
        .pipe(concat("date_range_picker_min.js"))
        .pipe(uglify("date_range_picker_min.js"))
        .pipe(gulp.dest("dist/scripts"));

});

gulp.task('sassToCSS', function() {
    var s = plugins.sass({});
    s.on('error', function (e) {
        console.log(e);
        s.end();
    });
    gulp.src('src/styles/**/*.scss')
        .pipe(s)
        .pipe(gulp.dest('dist/styles'));
});

gulp.task("sassToCSSMin", function () {
    var s = plugins.sass({});
    s.on('error', function (e) {
        console.log(e);
        s.end();
    });
    gulp.src('src/styles/**/*.scss')
        .pipe(s)
        .pipe(minifyCSS({keepBreaks:false}))
        .pipe(plugins.rename('calendar_min.css'))
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('images', function() {
    return gulp.src('src/css/images/**/*')
        // Pass in options to the task
        .pipe(plugins.imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('dist/styles/images'));
});

gulp.task('serve', function () {
    plugins.connect.server({
        port: 9000,
        root: '.temp'
    });
});

gulp.task("documentation", function () {
    gulp.src(path.scripts)
        .pipe(plugins.jsdoc('documentation'));
});
gulp.task('copyJS', function () {
    gulp.src(path.scripts)
        .pipe(gulp.dest('.temp'));
});

gulp.task('copyHTML', function () {
    gulp.src(path.html)
        .pipe(gulp.dest('.temp'));
});
gulp.task('copyCSS', function() {
    var s = plugins.sass({});
    gulp.src(path.scss)
        .pipe(s)
        .pipe(gulp.dest('.temp'));
});
gulp.task('deploy', ['scripts:calendar', 'scripts:dateRangePicker',
    'scripts:calendarMin', 'scripts:dateRangePickerMin',
    'sassToCSS', 'sassToCSSMin', 'images']);
gulp.task('watch', function () {
    gulp.watch('src/scripts', ['copyJS']);
    gulp.watch('demo', ['copyHTML']);
    gulp.watch('src/css', ['copyCSS']);
});
gulp.task('build', ['scripts:calendar', 'scripts:dateRangePicker',
    'scripts:calendarMin', 'scripts:dateRangePickerMin',
    'sassToCSS', 'sassToCSSMin', 'images']);
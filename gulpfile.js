
const browserify = require('browserify');
const babelify = require('babelify');
const tsify = require('tsify');
const gulp = require("gulp");
const compass = require("gulp-compass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

// Styles

gulp.task("compass", function () {
    return gulp.src("./src/styles/*.scss")
        .pipe(compass({
            css: "./tmp/styles",
            sass: "./src/styles"
        }));
});

gulp.task("styles", ["compass"], function () {
    return gulp.src("./tmp/styles/*.css")
        .pipe(autoprefixer({
            browsers: ["last 2 versions"],
            cascade: true
        }))
        .pipe(gulp.dest("./app/styles"));
});

gulp.task("styles-watch", ["styles"], function () {
    browserSync.reload("*.css");
});

// Scripts

gulp.task("scripts", function () {
    return browserify("./src/scripts/app.ts", {debug: true})
        .plugin("tsify")
        .transform(babelify.configure({extensions: [".ts", ".js"], presets: ["es2015"]}))
        .bundle()
        .on("error", function (err) {
            console.error(err);
            this.emit("end");
        })
        .pipe(source("app.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
            // .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./app/scripts"));
});

gulp.task("scripts-watch", ["scripts"], function () {
    browserSync.reload("*.js");
});

// Tasks

gulp.task("build", ["styles", "scripts"]);

gulp.task("server", ["build"], function () {
    browserSync.init({
        server: {
            baseDir: "./app"
        },
        ghostMode: false
    });

    gulp.watch("./app/index.html").on("change", function () {
        browserSync.reload();
    });
    gulp.watch("./src/styles/**", ["styles-watch"]);
    gulp.watch("./src/scripts/**", ["scripts-watch"]);
});

gulp.task("default", ["server"]);

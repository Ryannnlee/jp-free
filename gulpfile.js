const gulp = require('gulp')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const babel = require('gulp-babel')
const browserSync = require('browser-sync')
const autoprefixer = require('gulp-autoprefixer')
const uglify = require('gulp-uglify')
const uglifycss = require('gulp-uglifycss')
const del = require('del')
const vinylPaths = require('vinyl-paths')
const gutil = require('gulp-util')
const eslint = require('gulp-eslint')
const plumber = require('gulp-plumber')
const imagemin = require('gulp-imagemin')
sass.compiler = require('node-sass')

// 處理html
gulp.task('clean-html', function() {
    return gulp.src('build/*.html').pipe(vinylPaths(del))
})

gulp.task('html', ['clean-html'], function() {
    gulp.src(['src/*.pug'])
        .pipe(plumber())
        .pipe(
            pug({
                // Your options in here.
            })
        )
        .pipe(gulp.dest('build'))
})

// 處理css
gulp.task('clean-styles', function() {
    return gulp.src('build/assets/styles/*').pipe(vinylPaths(del))
})

gulp.task('styles', ['clean-styles'], function() {
    return gulp
        .src('src/assets/styles/**/*.scss')
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        .pipe(
            autoprefixer({
                browsers: ['last 5 versions'],
                cascade: false
            })
        )
        .pipe(gutil.env.env === 'dev' ? gutil.noop() : uglifycss())
        .pipe(gulp.dest('build/assets/styles'))
})

// 處理js
gulp.task('clean-scripts', function() {
    return gulp.src('build/assets/scripts/*').pipe(vinylPaths(del))
})

gulp.task('scripts', ['clean-scripts'], function() {
    gulp.src(['src/assets/scripts/*.js'])
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(
            babel({
                presets: ['@babel/env']
            })
        )
        .on('error', function(err) {
            gutil.log(gutil.colors.red('[Babel Error]'))
            gutil.log(gutil.colors.red(err.message + '\n'))
            console.log(err.codeFrame)
            this.emit('end')
        })
        .pipe(gutil.env.env === 'dev' ? gutil.noop() : uglify())
        .pipe(gulp.dest('build/assets/scripts'))

    gulp.src(['src/assets/scripts/lib/*.js']).pipe(
        gulp.dest('build/assets/scripts/lib')
    )
})

// 處理圖片
gulp.task('clean-images', function() {
    return gulp.src('build/assets/images/*').pipe(vinylPaths(del))
})

gulp.task('images', ['clean-images'], function() {
    gulp.src(['src/assets/images/**/*'])
        .pipe(plumber())
        .pipe(gutil.env.env === 'dev' ? gutil.noop() : imagemin())
        .pipe(gulp.dest('build/assets/images'))
})

gulp.task('build', ['html', 'styles', 'scripts', 'images'])

// 監聽檔案
gulp.task('watch', function() {
    gulp.watch('src/assets/styles/**/*.scss', ['styles'])
    gulp.watch('src/assets/scripts/*', ['scripts'])
    gulp.watch('src/assets/images/**/*', ['images'])
    gulp.watch('src/**/*.pug', ['html'])
})

// 開發用伺服器
gulp.task('browser-sync', function() {
    return browserSync({
        files: '**',
        server: {
            baseDir: 'build/',
            index: 'index.html'
        },
        port: 9527,
        host: '0.0.0.0',
        ui: false
    })
})

gulp.task('default', ['build'], function() {
    gulp.start('browser-sync')
    gulp.start('watch')
})

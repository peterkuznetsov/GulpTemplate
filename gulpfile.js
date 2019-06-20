var gulp       = require('gulp'),
	sass         = require('gulp-sass'),
	browserSync  = require('browser-sync'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglifyjs'),
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'),
	del          = require('del'),
	imagemin     = require('gulp-imagemin'),
	pngquant     = require('imagemin-pngquant'),
	cache        = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer');

var js_libs = [
	'app/libs/jquery/jquery.min.js'
];

gulp.task('sass', function() {
	return gulp.src(['app/sass/**/*.sass', '!app/sass/**/libs.sass'])
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}))
});
gulp.task('css_libs', function() {
	return gulp.src('app/sass/**/libs.sass')
		.pipe(sass())
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}))
});
gulp.task('js_libs', function() {
	return gulp.src(js_libs)
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.reload({stream: true}))
});



gulp.task('browser_sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});
gulp.task('reload_html', function() {
	return gulp.src('app/*.html')
	.pipe(browserSync.reload({ stream: true }))
});



gulp.task('del_build', async function() {
	return del.sync('dist');
});
gulp.task('img', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin({ // С кешированием
	 // .pipe(imagemin({ // Сжимаем изображения без кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))/**/)
		.pipe(gulp.dest('dist/img'));
});
gulp.task('prebuild', async function() {
	var buildCss = gulp.src(['app/css/main.css', 'app/css/libs.min.css'])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));
});

gulp.task('clear_cache', function (callback) {
	return cache.clearAll();
})



gulp.task('watch', function() {
	gulp.watch('app/sass/**/*.sass', gulp.parallel('sass', 'css_libs'));
	gulp.watch('app/*.html', gulp.parallel('reload_html'));
	gulp.watch(['app/js/common.js', 'app/libs/**/*.js'], gulp.parallel('js_libs'));
});
gulp.task('default', gulp.parallel('sass', 'css_libs', 'js_libs', 'browser_sync', 'watch'));
gulp.task('build', gulp.series('sass', 'js_libs', 'del_build', 'prebuild', 'img'));
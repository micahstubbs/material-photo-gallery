var gulp            = require('gulp');
var sass            = require('gulp-sass');
var concat          = require('gulp-concat');
var uglify          = require('gulp-uglify');
var rename          = require('gulp-rename');
var minifyCSS       = require('gulp-minify-css');
var postcss         = require('gulp-postcss');
var sourcemaps      = require('gulp-sourcemaps');
var autoprefixer    = require('autoprefixer');
var browserify      = require('browserify');
var source          = require('vinyl-source-stream');
var buffer          = require('vinyl-buffer');
var jshint          = require('gulp-jshint');

var paths = {

	root: './',
	index: './index.html',

	src: {
		scss: './src/scss/*scss',
		js: './src/js/*.js',
		jsIndex: './src/js/index.js',
		jsMain: './src/js/material-photo-gallery.js'
	},

	dist: {
		css: './dist/css',
		js: './dist/js',
		bundle: './dist/js/bundle.js'
	}

};

gulp.task('init', ['scss', 'browserify', 'lint'], function() {
	gulp.watch(paths.src.scss, ['scss']);
	gulp.watch(paths.src.js, ['lint', 'browserify']);
});

gulp.task('scss', function() {
	return gulp.src(paths.src.scss)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.on('error', handleError)
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(minifyCSS())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.dist.css));
});

gulp.task('browserify', function() {
	return browserify(paths.src.jsIndex)
		.bundle()
		.on('error', handleError)
		.pipe(source('material-photo-gallery.js'))
		.pipe(buffer())
		.pipe(gulp.dest(paths.dist.js))
		.pipe(uglify())
		.pipe(rename('material-photo-gallery.min.js'))
		.pipe(gulp.dest(paths.dist.js));
});

gulp.task('lint', function() {
	return gulp.src(paths.src.jsMain)
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

// Handle errors and continue watching files
function handleError(err) {
	console.log(err.toString());
	this.emit('end');
}


gulp.task('default', ['init']);
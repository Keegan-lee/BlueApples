var gulp = require('gulp');
var inject = require('gulp-inject');
var watch = require('gulp-watch');
var minifyJS = require('gulp-uglify');
var sass = require('gulp-sass');
var gnf = require('gulp-npm-files');
var del = require('del');
var wiredep = require('wiredep').stream;

var srcPaths = {
	npmJS: ['./public/node_modules/**/*.min.js',
			'!./public/node_modules/angular-material/modules/**/*',
			'!./public/node_modules/angular-material/layouts/**/*',
			'!./public/node_modules/**/*.slim.min.js',
			'!./public/node_modules/**/sizzle.min.js'],
	npmCSS: ['./public/node_modules/**/*.min.css',
			 '!./public/node_modules/angular-material/modules/**/*',
			 '!./public/node_modules/angular-material/layouts/**/*'],
	src: './src/',
	index: './src/index.html',
	javascript: './src/js/**/*.js',
	controllers: './src/controllers/**/*.js',
	services:'./src/services/**/*.js',
	components: './src/components/**/*.js',
	style: {
		main: './src/style/main.{scss, sass}',
		all: './src/style/**/*.{scss, sass}'
	},
	img: './src/img/**/*.*',
	html: './src/templates/**/*.html',
	php: './src/**/*.php',
	favicon: './src/favicon.ico',
	htaccess: './src/.htaccess',
	shop: './src/shop/**/*.*',
	data: './src/data/**/*.*'
}

var destPaths = {
	dest: './public/',
	index: './public/index.html',
	html: './public/templates/',
	javascript: './public/js/',
	controllers: './public/controllers/',
	services: './public/services/',
	components: './public/components',
	style: {
		folder: './public/css/',
		files: './public/css/*.css'
	},
	img: './public/img/',
	shop: './public/shop',
	data: './public/data/'
};

gulp.task('watch', function() {
	gulp.watch(srcPaths.javascript, ['js']);
	gulp.watch(srcPaths.controllers, ['controllers']);
	gulp.watch(srcPaths.services, ['services']);
	gulp.watch(srcPaths.components, ['components']);
	gulp.watch(srcPaths.style.all, ['style']);
	gulp.watch(srcPaths.html, ['html']);
	gulp.watch(srcPaths.index, ['inject']);
	gulp.watch(srcPaths.php, ['php']);
	gulp.watch(srcPaths.img, ['img']);
	gulp.watch(srcPaths.htaccess, ['htaccess']);
	gulp.watch(srcPaths.shop, ['shop']);
	gulp.watch(srcPaths.data, ['data']);
});

gulp.task('clean', function() {
	return del.sync(destPaths.dest);
});

gulp.task('data', function() {
	return gulp.src(srcPaths.data)
		.pipe(gulp.dest(destPaths.data));
});


gulp.task('style', function() {
	return gulp.src(srcPaths.style.main)
		.pipe(sass())
		.pipe(gulp.dest(destPaths.style.folder));
});

gulp.task('controllers', function() {
	return gulp.src(srcPaths.controllers)
		// .pipe(minifyJS())
		.pipe(gulp.dest(destPaths.controllers));
});

gulp.task('services', function() {
	return gulp.src(srcPaths.services)
		// .pipe(minifyJS())
		.pipe(gulp.dest(destPaths.services));
});

gulp.task('components', function() {
	return gulp.src(srcPaths.components)
		// .pipe(minifyJS())
		.pipe(gulp.dest(destPaths.components));
});


gulp.task('js', function() {
	return gulp.src(srcPaths.javascript)
		// .pipe(minifyJS())
		.pipe(gulp.dest(destPaths.javascript))
});

gulp.task('img', function() {
	return gulp.src(srcPaths.img)
		.pipe(gulp.dest(destPaths.img));
});

gulp.task('php', function() {
	return gulp.src(srcPaths.php)
		.pipe(gulp.dest(destPaths.dest));
});

gulp.task('misc', function() {
	return gulp.src(srcPaths.favicon)
		.pipe(gulp.dest(destPaths.dest));
});

gulp.task('htaccess', function() {
	return gulp.src(srcPaths.htaccess)
		.pipe(gulp.dest(destPaths.dest));
});


gulp.task('html', function() {
	return gulp.src(srcPaths.html)
		.pipe(gulp.dest(destPaths.html));
});

gulp.task('shop',['data'], function() {
	return gulp.src(srcPaths.shop)
		.pipe(gulp.dest(destPaths.shop));
});

gulp.task('bower', function() {
	return gulp.src(srcPaths.index)
		.pipe(wiredep())
		.pipe(gulp.dest(destPaths.dest));
});

gulp.task('inject', ['style', 'bower'], function() {

	var injectFiles = gulp.src(srcPaths.npmJS.concat(srcPaths.npmCSS).concat(srcPaths.javascript).concat(destPaths.style.files).concat(srcPaths.controllers).concat(srcPaths.services).concat(srcPaths.components));
	var injectOptions = {
		addRootSlash : false,
		ignorePath : ['public', 'src']
	};

	return gulp.src(destPaths.index)
		.pipe(inject(injectFiles, injectOptions))
		.pipe(gulp.dest(destPaths.dest));
});

gulp.task('default', ['clean', 'inject', 'html', 'htaccess', 'misc', 'php', 'img', 'watch', 'js', 'controllers', 'services', 'components', 'shop', 'watch']);

/*jshint node:true */
module.exports = function (grunt) {
	'use strict';

	// Override environment based line endings enforced by Grunt
	grunt.util.linefeed = '\n';

	// Grunt configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('meta.json'),
		meta: {
			banner: '/*!\n' +
				' * <%= pkg.name %> <%= pkg.version %> - <%= grunt.template.today("dS mmm yyyy") %>\n' +
				' * <%= pkg.repository.homepage %>\n' +
				' *\n' +
				' * Licensed under the <%= pkg.licenses[0].type %> license.\n' +
				' * <%= pkg.licenses[0].url %>\n' +
				' */\n',
			bannerLight: '/*! <%= pkg.name %> <%= pkg.version %>' +
				' - <%= grunt.template.today("dS mmm yyyy") %> | <%= pkg.repository.homepage %> */'
		},

		// JSHint the code.
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['src/*.js']
		},

		// Clean folders.
		clean: {
			dist: ['dist/**', '!dist']
		},

		// Concatenate files.
		concat: {
			dist: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.js'
			}
		},

		// Minify UglifyJS.
		uglify: {
			dist: {
				options: {
					banner: '<%= meta.bannerLight %>\n'
				},
				src: 'src/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},

		// Bump up fields in JSON files.
		bumpup: {
			options: {
				updateProps: {
					pkg: 'meta.json',
				},
			},
			files: ['meta.json', '<%= pkg.name %>.jquery.json'],
		},

		// Commit changes and tag the latest commit with a version from JSON file.
		tagrelease: '<%= pkg.version %>'
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-tagrelease');
	grunt.loadNpmTasks('grunt-bumpup');

	// Build task.
	grunt.registerTask('build', function () {
		grunt.task.run('clean');
		grunt.task.run('concat');
		grunt.task.run('uglify');
	});

	// Release task.
	grunt.registerTask('release', function (type) {
		type = type ? type : 'patch';
		grunt.task.run('jshint');
		grunt.task.run('bumpup:' + type);
		grunt.task.run('build');
		grunt.task.run('tagrelease');
	});

	// Default task.
	grunt.registerTask('default', ['jshint']);
};
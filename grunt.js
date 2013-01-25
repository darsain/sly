/*jshint node:true */
/*global module */
module.exports = function(grunt) {
	'use strict';

	var fs = require('fs'),
		jshintOptions = JSON.parse(fs.readFileSync('.jshintrc'));

	grunt.initConfig({
		pkg: '<json:component.json>',
		meta: {
			banner: '/*!\n' +
				' * <%= pkg.name %> <%= pkg.version %> - <%= grunt.template.today("ddS mmm yyyy") %>\n' +
				' * <%= pkg.homepage %>\n' +
				' *\n' +
				' * Licensed under the <%= pkg.licenses[0].type %> license.\n' +
				' * <%= pkg.licenses[0].url %>\n' +
				' */',
			bannerLight: '/*! <%= pkg.name %> <%= pkg.version %>' +
				' <%= grunt.template.today("dd-mmm-yyyy") %> | <%= pkg.homepage %> */'
		},
		jshint: {
			options: jshintOptions
		},
		lint: {
			files: 'src/sly.js'
		},
		concat: {
			dist: {
				src: [
					'<banner:meta.banner>',
					'src/sly.js'
				],
				dest: 'dist/jquery.sly.js'
			}
		},
		gcc: {
			dist: {
				options: {
					banner: '<%= meta.bannerLight %>'
				},
				src: 'src/sly.js',
				dest: 'dist/jquery.sly.min.js'
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-gcc');

	// Defined tasks
	grunt.registerTask('default', 'lint');
	grunt.registerTask('release', 'lint concat gcc');
};
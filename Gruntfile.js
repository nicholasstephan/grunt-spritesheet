/*
 * grunt-spritesheet
 * https://github.com/nicholasstephan/grunt-spritesheet
 *
 * Copyright (c) 2013 Nicholas Stephan
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['test/tmp/*'],
    },

    // Configuration to be run (and then tested).
    spritesheet: {
      test: {
        sprites: {
          'test/tmp/img/icon.png': ['test/example_pngs/*.png'],
          'test/tmp/img/hover.png': ['test/example_pngs/*.png'],
          'test/tmp/img/active.png': ['test/example_pngs/*.png']
        },
        sheet: 'test/tmp/css/sheet.css',
        templateUrl: 'test/example_template.mustache'
      },
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'spritesheet']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};

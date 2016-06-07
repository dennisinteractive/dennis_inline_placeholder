/* global process */
/**
 * @file
 * Grunt task definitions.
 */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta: {
      dist: {
        outfile: 'app'
      },
      distroPath: process.env.DISTRO_PATH
    },

    clean: {
      before: ['js/dist/**/*']
    },

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        ignores: ['js/dist/**/*'],
        jshintrc: true
      },
      dist: ['Gruntfile.js', 'js/**/*.js']
    },

    concat: {
      dist: {
        src: ['js/src/app.js', 'js/src/ca.js', 'js/src/renderer.js'],
        dest: 'js/dist/<%= meta.dist.outfile %>.js',
      },
    },

    uglify: {
      dist: {
        files: {
          'js/dist/<%= meta.dist.outfile %>.js': ['js/dist/<%= meta.dist.outfile %>.js']
        }
      }
    },

    watch: {
      js: {
        files: ['<%= jshint.dist %>'],
        tasks: ['jshint']
      }
    }

  });

  // Load plugins.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hashres');

  // Meta tasks
  grunt.registerTask('pre-build', [
    'clean:before',
    'jshint'
  ]);

  grunt.registerTask('build', [
    'concat',
  ]);

  grunt.registerTask('post-build', [
    'uglify'
  ]);

  grunt.registerTask('do-build', [
    'pre-build',
    'build',
    'post-build'
  ]);

  grunt.registerTask('default', ['do-build']);
  grunt.registerTask('test', ['jshint']);
};

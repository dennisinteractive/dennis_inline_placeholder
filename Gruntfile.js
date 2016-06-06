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
      before: ['js/dist'],
      after: [
        'js/dist/**/*',                                                   // Clean everything in js/dist.
        '!js/dist/**',                           // Except the dfpinline folder.
        'js/dist/*',                             // Then clean everything inside dfpinline folder.
        '!js/dist/<%= meta.dist.outfile %>.js',  // Except our precious optimised bundle.
        '!js/dist/build.txt'                                              // Keep build.txt for future reference.
      ]
    },

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        ignores: ['js/dist/**/*'],
        jshintrc: true
      },
      dist: ['Gruntfile.js', 'js/**/*.js']
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: 'js/src',
          paths: {
            dfpinline: '.',
            domReady: '<%= meta.distroPath %>/libraries/domreadyjs/domReady',
            has: '<%= meta.distroPath %>/modules/custom/dennis_js/js/has',
            utils: '<%= meta.distroPath %>/modules/custom/dennis_js/js/utils',
            support: '<%= meta.distroPath %>/modules/custom/dennis_js/js/support',

            // Stub modules
            'jquery': 'empty:',
            'jquery.once': 'empty:',
            'drupal': 'empty:',
            'googletag': 'empty:'
          },
          modules: [
            { name: '<%= meta.dist.outfile %>' }
          ],

          dir: 'js/dist',
          enforceDefine: false,
          findNestedDependencies: true,
          preserveLicenseComments: false,
          generateSourceMaps: false,
          optimize: 'uglify2' // 'uglify2' or 'none'
        }
      }
    },

    hashres: {
      options: {
        // This filename format is looked up in _dennis_js_get_dist_path().
        fileNameFormat: '${name}.${hash}.${ext}',
      },
      dist: {
        src: ['js/dist/<%= meta.dist.outfile %>.js'],
        dest: []
      }
    },

    bytesize: {
      dist: {
        src: ['js/dist/<%= meta.dist.outfile %>*.js']
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
  grunt.loadNpmTasks('grunt-bytesize');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hashres');

  // Meta tasks
  grunt.registerTask('pre-build', [
    'clean:before',
    'jshint'
  ]);

  grunt.registerTask('build', [
    'requirejs',
  ]);

  grunt.registerTask('post-build', [
    'clean:after',
    // 'hashres',
    'bytesize'
  ]);

  grunt.registerTask('do-build', [
    'pre-build',
    'build',
    'post-build'
  ]);

  grunt.registerTask('default', ['do-build']);
  grunt.registerTask('test', ['jshint']);
};

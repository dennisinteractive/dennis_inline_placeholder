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
        dirname: 'dfpinline',
        outfile: 'app'
      }
    },

    clean: {
      before: ['js/dist'],
      after: [
        'js/dist/**/*',                                                   // Clean everything in js/dist.
        '!js/dist/<%= meta.dist.dirname %>/**',                           // Except the dfpinline folder.
        'js/dist/<%= meta.dist.dirname %>/*',                             // Then clean everything inside dfpinline folder.
        '!js/dist/<%= meta.dist.dirname %>/<%= meta.dist.outfile %>.js',  // Except our precious optimised bundle.
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
            domReady: '../../../../../libraries/domreadyjs/domReady',
            has: '../../../../custom/dennis_js/js/has',
            utils: '../../../../custom/dennis_js/js/utils',
            support: '../../../../custom/dennis_js/js/support',

            // Stub modules
            'jquery': 'empty:',
            'jquery.once': 'empty:',
            'drupal': 'empty:',
            'googletag': 'empty:'
          },
          modules: [
            { name: '<%= meta.dist.dirname %>/<%= meta.dist.outfile %>' }
          ],

          dir: 'js/dist',
          enforceDefine: false,
          findNestedDependencies: true,
          preserveLicenseComments: false,
          generateSourceMaps: false,
          optimize: 'none' // 'uglify2' or 'none'
        }
      }
    },

    hashres: {
      options: {
        // This filename format is looked up in _dennis_js_get_dist_path().
        fileNameFormat: '${name}.${hash}.${ext}',
      },
      dist: {
        src: ['js/dist/<%= meta.dist.dirname %>/<%= meta.dist.outfile %>.js'],
        dest: []
      }
    },

    bytesize: {
      dist: {
        src: ['js/dist/*.js', 'css/*.css']
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
    'hashres',
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

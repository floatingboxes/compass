module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    // Add vendor prefixes to CSS
    // =====================================
    autoprefixer: {
      target: {
        src: './src/css/*.css'
      }
    },

    // Deletes build folders
    // =====================================
    clean: {
      dev: {
        src: [ './build/dev' ]
      },
      stage: {
        src: [ './build/stage' ]
      },
      prod: {
        src: [ './build/prod']
      }
    },



    // Allow watch and server at the same time
    // =====================================
    concurrent: {
      dev: {
        tasks: ['watch', 'connect'],
        options: {
          logConcurrentOutput: true
        }
      }
    },


    // Development Web Server
    // =====================================
    connect: {
      dev: {
        options: {
          port: 4000,
          base: './build/dev',
          keepalive: true
        }
      }
    },


    // Copy css to build after sass'ed
    // =====================================
    copy: {
      css: {
        src: './src/css/styles.css',
        dest: './build/dev/css/styles.css',
      },
    },

    // Shell commands
    // =====================================
    exec: {
      // depends on s3_website ruby gem and s3_website.yml in working directory to push
      // production build file to s3.
      // DANGER: will happily deploy empty directory to s3, deleting entire website. Make sure this is
      // never used without first running prod build
      deployprodtos3: 's3_website push'
    },

    // Deploy via FTP
    // =====================================

    'ftp-deploy': {
      stage: {
        auth: {
          host: 'recreant.net',
          port: 21,
          authKey: 'staging-key'
        },
        src: './build/stage',
        dest: 'html/',
      }
    },



    // Reduce image size
    // =====================================
    imagemin: {
      all: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['img/**/*.{png,jpg,gif}'],
          dest: 'src/'
        }]
      }
    },


    // Build Site w/ Jekyll
    // =====================================
    jekyll: {
      dev: {
        options: {
          src: './src',
          dest: './build/dev'
        }
      },
      stage: {
        options: {
          src: './src',
          dest: './build/stage'
        }
      },
      prod: {
        options: {
          src: './src',
          dest: './build/prod'
        }
      }
    },

    // Build Sass Files
    // =====================================
    sass: {
      dev: {
        options: {
            style: 'compact'
        },
        files: {
            './src/css/styles.css': './src/css/styles.sass'
        }
      },
      stage: {
        options: {
            style: 'compressed'
        },
        files: {
            './src/css/styles.css': './src/css/styles.sass'
        }
      },
      prod: {
        options: {
            style: 'compressed'
        },
        files: {
            './src/css/styles.css': './src/css/styles.sass'
        }
      }
    },


    // Compress Javascript
    // =====================================
    uglify: {
      stage: {
        files: {
          './build/stage/js/index.js': ['./build/stage/js/index.js']
        }
      },
      prod: {
        files: {
          './build/prod/js/index.js': ['./build/prod/js/index.js']
        }
      }
    },


    // Watch files for changes
    // =====================================
    watch: {
      css: {
        files: ['./src/css/**/*.sass'],
        tasks: ['sass', 'autoprefixer', 'copy'],
        options: {
          spawn: false,
        }
      },
      jekyll: {
        files: ['./src/**/*.html', './src/**/*.md', './src/**/*.js', './src/**/*.yml', './src/**/*.svg'],
        tasks: ['jekyll:dev'],
        options: {
          spawn: false,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-ftp-deploy');
  grunt.loadNpmTasks('grunt-jekyll');

  grunt.registerTask('dev', ['clean:dev', 'sass:dev', 'autoprefixer', 'jekyll:dev', 'concurrent:dev']);
  grunt.registerTask('stage', ['clean:stage', 'sass:stage', 'autoprefixer', 'jekyll:stage', 'uglify:stage', 'ftp-deploy:stage']);
  grunt.registerTask('prod', ['clean:prod', 'sass:prod', 'autoprefixer', 'jekyll:prod', 'uglify:prod']);

  grunt.registerTask('deployprod', ['prod', 'exec:deployprodtos3']);
};

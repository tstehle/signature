module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        nodeunit: {
            all: ['test/node/*.js']
        },
        jasmine: {
            pivotal: {
                src: 'src/**/*.js',
                options: {
                    specs: 'test/browser/*.js'
                }
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'test/**/*.js', 'src/**/*.js'],
            jshintrc: 'src/.jshintrc'
        },
        concat: {
            options: {
                separator: '\n\n',
                banner: '(function () {\n\n',
                footer: '\n}());'
            },
            dist: {
                src: [
                    'src/helpers/*.js',
                    'src/main.js'
                ],
                dest: 'build/signature.js'
            }
        },
        watch: {
            scripts: {
                files: 'src/**/*.js',
                tasks: ['jshint', 'concat', 'uglify',/*'jasmine',*/ 'nodeunit'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    // Load our plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-compare-size');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // Our tasks
    grunt.registerTask('test', ['jshint', 'concat', 'uglify'/*, 'jasmine'*/, 'nodeunit']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
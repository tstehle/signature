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
            complete: ['test/node/signature.js'],
            quick: ['test/node/quick.js']
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
            beforeconcat: ['Gruntfile.js', 'test/**/*.js', 'src/**/*.js'],
            afterconcat: ['build/<%= pkg.name %>.js'],
            options: {
                evil: true
            }
        },
        concat: {
            options: {
                separator: '\n\n',
                banner: '(function () {\n\n    var version = "<%= pkg.version %>";\n\n',
                footer: '\n}());'
            },
            latest: {
                src: [
                    'src/helpers/*.js',
                    'src/main.js'
                ],
                dest: 'build/<%= pkg.name %>.js'
            },
            archive: {
                src: [
                    'src/helpers/*.js',
                    'src/main.js'
                ],
                dest: 'build/old/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        watch: {
            scripts: {
                files: 'src/**/*.js',
                tasks: ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify',/*'jasmine',*/ 'nodeunit:quick'],
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
    grunt.registerTask('test', ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify'/*, 'jasmine'*/, 'nodeunit:complete']);
    grunt.registerTask('quick', ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify', 'nodeunit:quick']);
    grunt.registerTask('default', ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'uglify']);
};
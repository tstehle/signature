module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        nodeunit: {
            all: ['test/**/*.js']
        },
        jshint: {
            all: ['test/**/*.js', 'src/**/*.js'],
            jshintrc: 'src/.jshintrc'
        }
    });

    // Load our plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-compare-size');
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // Our tasks.
    grunt.registerTask('test', ['jshint', 'nodeunit']);
    grunt.registerTask('default', ['uglify']);

};
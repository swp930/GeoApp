module.exports = function (grunt) {

    'use strict';

    const packageInfo = require('./package.json');
    const packager = require('electron-packager');

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        clean: {
            'dist': 'dist/**/*',
            'dist-app': `dist/${packageInfo.name}-darwin-x64/${packageInfo.name}.app/Contents/Resources/app/**/*`,
            'license': [
                `dist/${packageInfo.name}-darwin-x64/LICENSE`,
                `dist/${packageInfo.name}-darwin-x64/version`
            ]
        },
        copy: {
            'dist-app': {
                expand: true,
                cwd: `dist/${packageInfo.name}-darwin-x64/${packageInfo.name}.app/Contents/Resources/app/`,
                src: [
                    'app.asar.unpacked/**/*',
                    'app.asar'
                ],
                dest: `dist/${packageInfo.name}-darwin-x64/${packageInfo.name}.app/Contents/Resources/`
            }
        }
    });

    grunt.registerTask('package', function () {
        var done = this.async();

        var options = {
            'dir': './app',
            'name': packageInfo.name,
            'app-version': packageInfo.version,
            'icon': 'sfl_sdk_osx.icns',
            'out': 'dist',
            'overwrite': true,
            'version': packageInfo.dependencies['electron-prebuilt'],
            'platform': 'darwin',
            'arch': 'x64',
            'prune': false
        };

        packager(options, error => {
            if (error) {
                grunt.fail.fatal(error);
            } else {
                done();
            }
        });
    });

    grunt.registerTask('build', [
        'clean:dist',
        'package',
        'copy:dist-app',
        'clean:dist-app',
        'clean:license'
    ]);
};

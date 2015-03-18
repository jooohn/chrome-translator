gulp = require 'gulp'
source = require 'vinyl-source-stream'
browserify = require 'browserify'
debowerify = require 'debowerify'
tsify = require 'tsify'

gulp.task 'build', ->
  browserify({basedir: __dirname + '/src', debug: true})
    .add './content.ts'
    .plugin tsify
    .transform debowerify
    .bundle()
    .pipe source 'content_script.js'
    .pipe gulp.dest 'app/src'

gulp.task 'copy', ->
  gulp.src 'manifest.json'
    .pipe gulp.dest 'app'

gulp.task 'watch', ['default'], ->
  gulp.watch './src/**/*.ts', ['default']

gulp.task 'default', ['build', 'copy']

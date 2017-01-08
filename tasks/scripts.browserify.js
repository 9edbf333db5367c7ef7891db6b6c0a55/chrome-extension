export function transformScriptsUsingBrowserify(gulp, plugins, paths) {
  return () => {
    const production = (process.env.ENV == 'production');
    // console.log('Enviroment: ' + String(process.env.ENV));

    return plugins.browserify({
        entries: './app/scripts/main.js',
        debug: true,
        paths: [paths.scripts],
      })
      .transform(plugins.babelify)
      .bundle()
      .pipe(plugins.source('main.js'))
      // vinyl-source-stream makes the bundle compatible with gulp
      .pipe(plugins.buffer())
      .pipe(plugins.size({ title: 'Before:', showFiles: true }))
      .pipe(plugins.if(production, plugins.sourcemaps.init({ loadMaps: true })))
      // Add transformation tasks to the pipeline here.
      .pipe(plugins.if(production, plugins.uglify()))
      // .pipe(plugins.if(production, plugins.rename('main.min.js')))
      .on('error', plugins.util.log)
      .pipe(plugins.if(production, plugins.sourcemaps.write('./maps')))
      .pipe(gulp.dest(process.env.PROJECT_BUILD_FOLDER + '/scripts'))
      .pipe(plugins.browserSync.stream({ match: '**/*.js' }))
      .pipe(plugins.size({ title: 'After:', showFiles: true }));
  }
};

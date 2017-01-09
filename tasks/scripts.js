export function transpileScripts(gulp, plugins, paths) {
  const production = (process.env.ENV == 'production');
  const browserify = () => {
    return plugins.eventStream.map((file, fn) => {
      const b = plugins.browserify({
        entries: file.path,
        debug: true,
        paths: [paths.scripts],
        transform: [plugins.babelify]
      });

      file.contents = b.bundle();
      fn(null, file);
    });
  };

  return () => {
    gulp.src('app/scripts/*.js')
      .pipe(browserify())
      .pipe(plugins.buffer())
      .pipe(plugins.size({ title: 'Before:', showFiles: true }))
      .pipe(plugins.sourcemaps.init({ loadMaps: true }))
      // .pipe(plugins.concat('main.js'))
      .pipe(plugins.if(production, plugins.uglify({ preserveComments: 'some' })))
      // Output files
      .pipe(plugins.sourcemaps.write('./maps'))
      .pipe(gulp.dest(process.env.PROJECT_BUILD_FOLDER + '/scripts'))
      .pipe(plugins.browserSync.stream({ match: '**/*.js' }))
      .pipe(plugins.size({ title: 'After:', showFiles: true }));
  };
};

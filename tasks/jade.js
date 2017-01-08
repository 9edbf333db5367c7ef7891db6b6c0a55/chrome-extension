export function compileJade(gulp, plugins, paths) {
  return () => {
    return gulp.src(paths.jade)
      .pipe(plugins.jade())
      .pipe(plugins.prettify({ indent_size: 4 }))
      .pipe(gulp.dest(process.env.PROJECT_BUILD_FOLDER))
      // inline plugin that inlines CSS in the HTML
      // dependencies: juice & event-stream modules
      .pipe(function juice(options) {
        options = options || {};
        return plugins.eventStream.map((file, fn) => {
          plugins.juice.juiceResources(file.contents.toString(), options, (err, html) => {
            if (err) return fn(err);
            file.contents = new Buffer(html);
            fn(null, file);
          });
        });
      }())
      .pipe(gulp.dest(process.env.PROJECT_BUILD_FOLDER))
      .pipe(plugins.browserSync.stream({ match: '**/*.html' }));
  };
};

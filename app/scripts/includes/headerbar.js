export default () => {
  return new Promise((resolve) => {
    // Add the Vitumob header bar to the page
    const headerBarTemplate = chrome.extension.getURL('injectables/header-bar.html');
    $('<div id=\'vitumob-header-bar\' />').prependTo('body').load(headerBarTemplate, () => {
      const headerBar = $('#vm-header-bar');
      let stickyHeaderBar = $('#vitumob-fixed-header');

      // clone the header bar and append it to the page with additional custom styling
      if (stickyHeaderBar.length < 1) {
        const cssStyling = {
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9990,
          width: '100%',
        };
        const stickyHeader = headerBar.clone();
        stickyHeader.css(cssStyling);
        stickyHeaderBar = $(stickyHeader).appendTo('body')
          .wrap('<div id=\'vitumob-fixed-header\'>');
      }

      // add scroll behaviour for the sticky headerBar
      $(document).on('scroll', () => {
        if (window.scrollY > headerBar.height() * 0.80) {
          stickyHeaderBar.show();
        } else {
          stickyHeaderBar.hide();
        }
      });
      resolve({ headerBar, stickyHeaderBar });
    });
  });
};

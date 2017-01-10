export default () => {
  // TO DO: Trottle/Debounce the header clicking to be clicked once every 3 seconds
  const headerBarOnClick = () => {
    // check if it's the cart page
    // if not redirect the user to the card page
    // wait for it to load
    // check for the VM hashtag in the page
    // tell the user VM has began extracting the items in the page
    // wait for the page to complete loading then start the extraction
  };

  return new Promise((resolve) => {
    // Add the Vitumob header bar to the page
    const headerBarTemplate = chrome.extension.getURL('injectables/header-bar.html');
    $('<div id=\'vitumob-header-bar\' />').prependTo('body').load(headerBarTemplate, () => {
      const headerBar = $('.vm-header-bar');
      headerBar.click(headerBarOnClick);

      // clone the header bar and append it to the page with additional custom styling
      const stickyHeaderBar = $('.vitumob-fixed-header');
      if (stickyHeaderBar.length < 1) {
        const cssStyling = {
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          width: '100%',
        };
        const stickyHeader = headerBar.clone();
        stickyHeader.css(cssStyling).addClass('vitumob-fixed-header');
        $('body').prepend(stickyHeader);
      }

      // add scroll behaviour for the sticky headerBar
      $(document).on('scroll', () => {
        if (window.scrollY > headerBar.height()) {
          stickyHeaderBar.show();
          return;
        }

        stickyHeaderBar.hide();
      });
      resolve(null);
    });
  });
};

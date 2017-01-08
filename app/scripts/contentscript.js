$(document).ready(() => {
  $('<div id=\'vitumob-header-bar\' />')
    .prependTo('body')
    .load(chrome.extension.getURL('injectables/header-bar.html'));

  $('<div id=\'vitumob-modal-box\' />')
    .prependTo('body')
    .load(chrome.extension.getURL('injectables/modal-box.html'));

  $(document).on('scroll', function() {
    let header; // if someone has scrolled, dublicate and place the header at the top fixed pos
    const headerBar = $('.vm-header-bar');
    const cssStyling = {
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      width: '100%'
    };

    if (window.scrollY > headerBar.height()) {
      if ($('.vitumob-fixed-header').length < 1) {
        header = headerBar.clone();
        header.css(cssStyling).addClass('vitumob-fixed-header');
        header.click(() => { console.log('clicked'); });
        $('body').prepend(header);
      } else {
        $('.vitumob-fixed-header').show();
      }
    } else { // else if it was created, hide it
      if ($('.vitumob-fixed-header')) $('.vitumob-fixed-header').hide();
    }
  });
});

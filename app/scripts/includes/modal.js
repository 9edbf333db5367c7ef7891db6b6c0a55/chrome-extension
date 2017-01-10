export default () => {
  // Add the Vitumob header bar to the page
  return new Promise((resolve) => {
    const modalTemplate = chrome.extension.getURL('injectables/modal.html');
    $('<div id=\'vitumob-modal\' />').prependTo('body').load(modalTemplate, () => {
      resolve(null);
    });
  });
};

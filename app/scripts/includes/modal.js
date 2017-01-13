export default () => {
  // Add the Vitumob header bar to the page
  return new Promise((resolve) => {
    const modalTemplate = chrome.extension.getURL('injectables/modal.html');
    $('<div id=\'vitumob-modal-box\' />').prependTo('body').load(modalTemplate, () => {
      $('.vm-okay-button').click(function hideModalFooter() {
        $(this).parent().parent().hide();
      });

      $('.vm-cancel-button').click(() => {
        // TO DO:
        // revert(remove) the checkout items that were just checked out
        // get the ORDER ID, get the ITEMS related to the ID and DELETE them
        // DELETE /order/:orderId
      });
      resolve($('#vm-modal-box'));
    });
  });
};

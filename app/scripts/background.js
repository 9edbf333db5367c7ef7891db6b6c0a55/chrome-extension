$(document).ready(() => {
  chrome.runtime.onMessage.addListener((r, tab) => {
    if (r.type === 'SHOPPING_CART_IS_EMPTY') {
      // browser push notification
      chrome.notifications.create(tab.id, {
        title: 'Shopping cart is EMPTY',
        iconUrl: 'images/vitumob/icon48.png',
        type: 'basic',
        message: `Please add items into the ${r.hostname} shopping cart before checking out.`,
      });
    }
  });
});

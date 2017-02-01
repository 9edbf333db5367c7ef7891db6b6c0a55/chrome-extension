import { v1 as uuidv1 } from 'node-uuid';
import config from './helpers/config';
import headerbar from './includes/headerbar';
import modal from './includes/modal';
import merchants from './merchants';


$(document).ready(() => {
  // Check if the site loaded is one of the merchants we support
  // and is not AWS's console/console
  let { hostname } = location;
  hostname = hostname.split('.').splice(-2).join('.');
  const isOtherAWSServices = /(aws|doc|console)/g.test(hostname);
  const isMerchant = $.inArray(hostname, config.merchants);

  // get user's UUID generated on 1st visit.
  // if user doesnt have one yet, we generate, assign him and store it locally
  let userId;
  chrome.storage.sync.get('vitumobUserUUID', (result) => {
    if (!('vitumobUserUUID' in result)) {
      userId = uuidv1();
      chrome.storage.sync.set({ vitumobUserUUID: userId });
      return;
    }

    userId = result.vitumobUserUUID;
  });

  if (isMerchant > -1 && !isOtherAWSServices) {
    // Add logic once headerbar & modal box have been injected and compiled
    Promise.all([headerbar(), modal()]).then((promised) => {
      // VM headerbar and modal injected into the merchant's page
      const { headerBar, stickyHeaderBar } = promised[0];
      const modalbox = promised[1];
      const merchantScraper = merchants[hostname.replace(/\.co(m|\.uk)/gi, '')].default;

      if ('headerBarEl' in merchantScraper) {
        if ($.isArray(merchantScraper.headerBarEl)) {
          merchantScraper.headerBarEl.forEach((elem) => {
            $(elem).css({
              top: parseFloat($(elem).css('top'), 10) + headerBar.height(),
            });
          });
        } else {
          $(merchantScraper.headerBarEl).css({
            top: parseFloat($(merchantScraper.headerBarEl).css('top'), 10) + headerBar.height(),
          });
        }
      }

      const vmCheckout = () => {
        try {
          modalbox.show();
          const cartItems = merchantScraper.scraper();
          if (!cartItems.length) {
            chrome.runtime.sendMessage({
              type: 'SHOPPING_CART_IS_EMPTY',
              hostname,
            });
            return;
          }

          const { name } = merchantScraper;
          const order = JSON.stringify({
            merchant: name.toLowerCase(),
            uuid: userId,
            items: cartItems.selector,
          });

          const request = new XMLHttpRequest();
          request.open('POST', 'https://vitumob-159912.appspot.com/order', true);
          request.setRequestHeader('Accept', 'application/json, */*');
          request.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
          request.onload = () => {
            if (request.readyState === request.DONE && request.status === 200) {
              const orderCreated = JSON.parse(request.responseText);

              // open a new tab, showing the user their cart
              chrome.runtime.sendMessage({
                type: 'OPEN_VITUMOB_CART',
                link: 'http://vitumob.com/cart/' + orderCreated.order_hex,
              });
            }
          };
          request.onerror = (error) => { console.error(error); };
          const orderToString = JSON.stringify({ order });
          request.send(orderToString);
        } catch (err) {
          // TO DO:
          // On error, GRAB MERCHANT CART HTML
          // stringify it and send it to VM admin as email
          console.error(err);
        }
      };

      // check for the VM hashtag in the page
      if (location.href.indexOf('vm-autocheckout') > -1) {
        // tell the user VM has began extracting the items in the page
        modalbox.find('.modal-action-merchant').text(hostname);
        modalbox.find('.modal-action-message').text('Please give us a few seconds...');
        modalbox.show();
        // wait for the page to complete loading then start the extraction
        window.onload = vmCheckout;
      }

      // TO DO: Trottle/Debounce the header clicking to be clicked once every 3 seconds
      const headerBarOnClick = () => {
        if (location.href.indexOf(merchantScraper.cartPath) === -1) {
          window.location = encodeURI(merchantScraper.cartPath + '#vm-autocheckout');
          return;
        }

        // user happens to be in the cart page, just load up the scrapper
        vmCheckout();
      };

      headerBar.click(headerBarOnClick);
      stickyHeaderBar.click(headerBarOnClick);
    });
  }
});

import config from './helpers/config';
import headerbar from './includes/headerbar';
import modal from './includes/modal';
import main from './main';

$(document).ready(() => {
  // Check if the site loaded is one of the merchants we support
  // and is not AWS's console/console
  let { hostname } = location;
  hostname = hostname.split('.').splice(-2).join('.');
  const isNotAWSConsole = 'aws' in hostname.split('.') || /(doc|console)/g.test(hostname);
  const isMerchant = $.inArray(hostname, config.merchants);

  if (isMerchant > -1 && !isNotAWSConsole) {
    // Add logic once headerbar & modal box have been injected and compiled
    Promise.all([headerbar(), modal()]).then((promised) => {
      // VM headerbar and modal injected into the merchant's page
      const { headerBar, stickyHeaderBar } = promised[0];
      const modalbox = promised[1];
      const merchantScraper = main[hostname.replace(/\.co(m|\.uk)/gi, '')].default;

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

          const orderToSubmit = Object.assign({}, { cartItems, merchantScraper });
          console.log(orderToSubmit);

          // For fetching dimension from items to used in Volumetric Weight Calculation
          if ('getItemShippingCost' in merchantScraper) {
            const shippingCosts = [];
            let timeOut = 0;
            for (let x = 0; x < cartItems.length; x + 10) {
              shippingCosts.push(merchantScraper.getItemShippingCost(cartItems.splice(x, 10), timeOut));
              timeOut += 1100;
            }

            Promise.all(shippingCosts).then(function allItemsShippingCost() {
              const itemsShippingCost = arguments.reduce((a, b) => a.concat(b), []);
              console.log(itemsShippingCost);
            });
          }
        } catch (err) {
          // On error, GRAB MERCHANT CART HTML, stringify it and send it to VM admin as email
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
          window.location = encodeURI(merchantScraper.cartPath + '?vmType=#vm-autocheckout');
          return;
        }

        // user happens to be in the cart page
        // just load up the scrapper
        vmCheckout();
      };

      headerBar.click(headerBarOnClick);
      stickyHeaderBar.click(headerBarOnClick);
    });
  }
});

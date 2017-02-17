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

          const performRequest = () => {
            const { name, host } = merchantScraper;
            const data = new FormData();
            data.append('order', JSON.stringify({ name, host, items: cartItems.selector }));

            const request = new XMLHttpRequest();
            request.open('POST', 'https://api.vitumob.xyz', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.onload = () => {
              if (request.readyState === request.DONE && request.status === 200) {
                // TO DO:
                // Get back the CART ID
                // Open new TAB with URL: http://vitumob.com/cart/:CART_ID and forcus on it
                console.log(request.responseText);
              }
            };
            request.onerror = (error) => { console.error(error); };
            request.send(data);
          };

          // For fetching dimension from items to used in Volumetric Weight Calculation
          if ('getItemShippingCost' in merchantScraper) {
            const shippingCosts = [];
            const items = cartItems.slice(0);
            let timeOut = 0;

            for (let x = 0; x < items.length; x + 10) {
              shippingCosts.push(merchantScraper.getItemShippingCost(items.splice(x, 10), timeOut));
              timeOut += 500;
            }

            Promise.all(shippingCosts)
              .then(function allItemsShippingCost() {
                const args = [...arguments[0]];
                const itemsShippingCost = args.reduce((acc, cur) => acc.concat(...cur), []);

                cartItems.forEach((item) => {
                  const shippingDetails = itemsShippingCost.find(sd => sd.asin === item.id);
                  item = Object.assign(item, shippingDetails);
                });

                performRequest();
              });
            return;
          }

          performRequest();
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

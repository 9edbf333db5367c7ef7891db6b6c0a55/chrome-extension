import moment from 'moment';
import hash from 'hash.js';

export default {
  name: 'Amazon',
  host: 'https://www.amazon.com',
  cartPath: '/gp/cart/view.html/ref=nav_cart',
  scraper() {
    // .not(...) removes items that are in wish list/saved for later
    const cartItems = $('#sc-active-cart .sc-list-body .sc-list-item')
      .not('.sc-action-move-to-cart');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.data('asin'); // used in fetching product details from Product REST API
      item.name = itemElement.find('.sc-product-link .sc-product-title').first().text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('img.sc-product-image').attr('src');
      item.link = 'https://www.amazon.com' + itemElement.find('.sc-product-link').attr('href');

      const dropdown = itemElement.find('.a-dropdown-prompt');
      if (dropdown.length >= 1 || (dropdown.text() && dropdown.text().indexOf('10+') === -1)) {
        item.quantity = parseInt(dropdown.text(), 10);
      } else {
        item.quantity = parseInt(itemElement.find('input.sc-quantity-textfield').val(), 10);
      }

      const priceString = itemElement.find('.sc-product-price').text().replace(/\$|,|\s/g, '');
      if (priceString.indexOf('£') > -1) {
        item.priceInPounds = true;
      }

      item.price = parseFloat(priceString, 10);
      return item;
    });
  },
  getItemShippingCost(items, timeOut = 0) {
    const AWSAccessKeyId = 'AKIAI6DWQQP2AACCGI6A';
    const AWSSecretKey = '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';
    const URI = 'https://webservices.amazon.com/onca/xml';

    return new Promise((resolve, reject) => {
      const queryParams = {
        AWSAccessKeyId,
        Service: 'AWSECommerceService',
        AssociateTag: 'vit09-20',
        Operation: 'ItemLookup',
        ItemId: items.map(item => item.id).join(','),
        ResponseGroup: 'ItemAttributes,OfferFull',
        Timestamp: moment(new Date()).utc().format(),
      };
      const queryStringParams = $.param(queryParams).split('&').sort().join('&');
      const stringToSign = `GET\nwebservices.amazon.com\n/onca/xml\n${queryStringParams}`;
      const hashBuffer = hash.hmac(hash.sha256, AWSSecretKey).update(stringToSign).digest('hex');
      queryParams.Signature = new Buffer(hashBuffer, 'hex').toString('base64');

      const restApiEndpoint = `${URI}?${$.param(queryParams)}`;
      const request = new XMLHttpRequest();
      request.open('GET', restApiEndpoint, true);
      request.onload = () => {
        if (request.readyState === request.DONE && request.status === 200) {
          console.log(request.responseText);
          const XMLHeader = /<\?[\w\s=.\-'"]+\?>/gi;
          const amazonXMLResponse = request.responseText.replace(XMLHeader, '');
          const soapDOM = $(amazonXMLResponse);
          const shippingInfo = this.extractShippingInformation(soapDOM);
          resolve(shippingInfo);
        }
      };
      request.onerror = (error) => { reject(error); };
      setTimeout(() => { request.send(); }, timeOut);
    });
  },
  extractShippingInformation(soapDOM) {
    const cartItems = soapDOM.find('Item');
    return cartItems.map(function loopItems() {
      const item = $(this);
      let shippingCost = 0;
      const shippingDetails = {};
      const PackageDimensions = item.find('PackageDimensions');
      if (PackageDimensions.length && PackageDimensions.children().length) {
        PackageDimensions.children().each(function loopElements() {
          const elem = $(this);
          let units = elem.attr('Units');
          let value = parseInt(elem.text(), 10);
          value = units.indexOf('hundredths') > -1 ? value / 100 : value;

          units = units.replace('hundredths-', '');
          switch (units) {
            case 'ounces':
              value *= 0.0283495;
              break;
            case 'inches':
              value *= 2.54;
              break;
            case 'pounds':
              value *= 0.453592;
              break;
            default:
              break;
          }

          shippingDetails[elem[0].localName.toLowerCase()] = value;
        });

        // calculate volumetric weight
        const { height, width, length } = shippingDetails;
        let volumetricWeight = height * width * length;
        volumetricWeight /= 6000;

        if (volumetricWeight > shippingDetails.weight) {
          shippingCost = volumetricWeight * 7.50;
        } else {
          shippingCost = shippingDetails.weight * 7.50;
        }
      } else {
        shippingCost += (2.20462 * 7.50);
      }

      // If it's not a prime item add 5 dollar on top for shipping
      if (item.find('IsEligibleForPrime').text().indexOf('0') > -1) {
        shippingCost += 5.00;
      }

      return {
        title: item.find('Title').text(),
        asin: item.find('ASIN').text(),
        shippingCost,
        shippingDetails,
      };
    });
  },
};

import querystring from 'querystring';
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
      item.link = itemElement.find('.sc-product-link').attr('href');

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
  itemLookUp(item) {
    // http://docs.aws.amazon.com/AWSECommerceService/latest/DG/rest-signature.html
    const AWSAccessKeyId = 'AKIAI6DWQQP2AACCGI6A';
    const AWSSecretKey = '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';

    const URI = 'https://webservices.amazon.com/onca/xml';
    const queryParams = {
      AWSAccessKeyId,
      Service: 'AWSECommerceService',
      AssociateTag: 'vit09-20',
      Operation: 'ItemLookup',
      ItemId: item.id,
      ResponseGroup: 'ItemAttributes,OfferFull',
      Timestamp: moment(new Date()).utc().format(),
    };
    let queryStringParams = querystring.stringify(queryParams).split('&');
    queryStringParams = queryStringParams.sort().join('&');

    const stringToSign = `GET\nwebservices.amazon.com\n/onca/xml\n${queryStringParams}`;
    const hashBuffer = hash.hmac(hash.sha256, AWSSecretKey).update(stringToSign).digest('hex');

    queryParams.Signature = new Buffer(hashBuffer, 'hex').toString('base64');

    const restApiEndpoint = `${URI}?${querystring.stringify(queryParams)}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', restApiEndpoint, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        console.log(xhr.responseText);
      }
    };
    xhr.send();
  },
};

// Volumetric weight is length x width x height in centimeters, divided by 6000.
// If you scroll down to Product Details, you will see the dimensions are 19.8 x 20.5 x 19.8 inches., or 8,037 cubic inches. That is 131,700 cubic centimeters. (To get cubic centimeters from cubic inches you always multiply by 16.387064.)

// To get volumetric weight, you divide cubic centimeters by 6000, so that equals 21.9 kg.

// Under Product Details, you will also see the shipping weight is 17.2 lbs., or 7.8 kg. (To get kg. from lbs. you always divide by 2.2)

// 21.9 kg. is greater than 7.8 kg., so our shipping cost is $219. The extension should add the $219 to the price of the product, $59.99, and so the total cost of the item is $278.99.

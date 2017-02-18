import { parse } from 'querystring';

export default {
  name: 'victoriassecret',
  host: 'https://www.victoriassecret.com/',
  cartPath: '/commerce2/checkout',
  headerBarEl: ['header.smoNavCondensedState section', '#nav-primary'],
  scraper() {
    // BUG FIXED: Fetches the content twice because of the floating hidden sidebar shopping cart
    const cartItems = $('.pinned-scroll-content > .fab-bag > .fab-product-selection');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};

      const queryString = itemElement.find('.product-name a').attr('href').split('?');
      const qr = parse(queryString[1]);
      item.id = qr.ProductID;
      item.name = itemElement.find('.product-name h2.short-description').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.img-container img').attr('src');
      item.link = location.hostname + itemElement.find('.img-container a').attr('href');
      item.quantity = parseInt(itemElement.find('.quantity .qty').text(), 10);

      const attrWrapper = itemElement.find('.product-info > p');
      if (attrWrapper.length) {
        attrWrapper.forEach((elem) => {
          const attribute = $(elem).find('span:first-child').text().trim();
          let value = $(elem).find('span:last-child').text().trim();
          value = attribute.indexOf('Qty') > -1 ? parseInt(value.toLowerCase().replace(/[a-z]+/g, ''), 10) : value;
          item[attribute.indexOf('Qty') > -1 ? 'quantity' : attribute.toLowerCase()] = value;
        });
      }

      const priceString = itemElement.find('.price p:first-child').text().replace(/\$|£|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

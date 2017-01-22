import { parse } from 'querystring';

export default {
  name: 'toysrus',
  host: 'https://www.toysrus.com',
  cartPath: '/cart/index.jsp',
  scraper() {
    const cartItems = $('table#cartProductsTable tbody tr.orderItem');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      const link = itemElement.find('.cartProductTitle').attr('href');
      const qr = parse(link.split('?')[1]);

      item.id = qr.productId;
      item.name = itemElement.find('.cartProductTitle').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = location.hostname + itemElement.find('.description a img').attr('src');
      item.link = location.hostname + itemElement.find('.cartProductTitle').attr('href');
      item.quantity = parseInt(itemElement.find('input.cartQtyValue').val(), 10);

      let priceString;
      const pricing = itemElement.find('.currency').first().contents();
      if (pricing.length && pricing.length <= 3) {
        priceString = pricing[pricing.length - 1].textContent.trim();
      } else {
        priceString = pricing[pricing.length - 1].textContent.trim();
      }

      item.price = parseFloat(priceString.replace(/\$|£|,|\s/g, ''), 10);
      return item;
    });
  },
};

import { parse } from 'querystring';

export default {
  name: 'bestbuy',
  host: 'https://www.bestbuy.com',
  cartPath: '/cart',
  scraper() {
    const cartItems = $('.listing .items > .line[id*="ci"]');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      const link = itemElement.find('.short-description').parent().attr('href');
      const qr = parse(link.split('?')[1]);

      item.id = qr.skuId;
      item.name = itemElement.find('.short-description').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.description .media img').attr('src');
      item.link = link;
      item.quantity = parseInt(itemElement.find('input.qty-input').val(), 10);

      const priceString = itemElement.find('.primary-price').text().replace(/\$|£|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

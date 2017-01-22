export default {
  name: 'zara',
  host: 'https://www.zara.com',
  cartPath: '/us/en/shop/cart',
  scraper() {
    const cartItems = $('.shop-cart-wrap table.order-table tr.order-item');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      const id = itemElement.find('.description._detail a').contents()[1];
      item.id = id.textContent.replace(/[a-z]+|\/|\./gi, '').trim();
      item.name = itemElement.find('.description._detail a span').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('._detail a img').attr('src');
      item.link = itemElement.find('.description._detail a').attr('href');
      item.quantity = parseInt(itemElement.find('.quantity ._quantity').text().trim(), 10);

      if (itemElement.find('.color').length) {
        item.color = itemElement.find('.color').text().trim();
      }

      if (itemElement.find('.size').length) {
        item.size = itemElement.find('.size').text().trim();
      }

      const priceString = itemElement.find('.price').text().replace(/\$|£|(USD)|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

export default {
  name: 'target',
  host: 'https://www.target.com',
  cartPath: 'https://www-secure.target.com/co-cart',
  scraper() {
    const cartItems = $('.product-list .cartItem[id*="product"]');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('.orderId').val();
      item.name = itemElement.find('.cartItem--title a').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.cartItem--image').attr('src');
      item.link = itemElement.find('.cartItem--title a').attr('href');
      item.quantity = parseInt(itemElement.find('.quantityDropdown--value').text(), 10);

      if (itemElement.find('.cartItem--title a').attr('color')) {
        item.color = itemElement.find('.cartItem--title a').attr('color');
      }

      if (itemElement.find('.cartItem--title a').attr('size')) {
        item.size = itemElement.find('.cartItem--title a').attr('size');
      }

      const priceString = itemElement.find('.cartItem--price').text().replace(/\$|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

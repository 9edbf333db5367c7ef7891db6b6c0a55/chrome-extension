export default {
  name: 'lessthan10pounds',
  host: 'https://www.lessthan10pounds.com',
  cartPath: '/checkout/cart/?___SID=U',
  scraper() {
    const cartItems = $('table#shopping-cart-table tbody tr');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = null;
      item.name = itemElement.find('.product-name-td h2.product-name a').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.product-image img').attr('src');
      item.link = itemElement.find('.product-name-td h2.product-name a').attr('href');
      item.quantity = parseInt(itemElement.find('input.qty').val(), 10);

      if (itemElement.find('.item-options dd').length) {
        itemElement.find('.item-options dd').forEach((elem) => {
          const attribute = $(elem).prev('dt').text().trim();
          item[attribute.toLowerCase()] = $(elem).text().trim();
        });
      }

      const priceString = itemElement.find('.cart-price .price').text().replace(/\$|£|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

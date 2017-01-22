export default {
  name: 'zulily',
  host: 'https://www.zulily.com',
  cartPath: '/2/cart',
  headerBarEl: '.navbar.navbar-fixed-top',
  scraper() {
    const cartItems = $('.products .product');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.data('product-id');
      item.name = itemElement.find('h3.product-name a').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.product-image img').attr('src');
      item.link = itemElement.find('.product-image').attr('href');
      item.quantity = parseInt(itemElement.find('.quantity input[name^="qty"]').val(), 10);

      if (itemElement.find('.size-container > p.size').children().length > 3) {
        item.size = itemElement.find('p.size span').text().trim();
      }

      const priceString = itemElement.find('.product-item-price p.price').text().replace(/\$|£|,|\s/g, '');
      item.price = parseFloat(priceString, 10);
      return item;
    });
  },
};

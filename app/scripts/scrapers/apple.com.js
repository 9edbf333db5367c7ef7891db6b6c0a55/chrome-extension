export default {
  name: 'apple',
  host: 'https://www.apple.com',
  cartPath: '/shop/bag',
  headerBarEl: 'nav#ac-globalnav',
  scraper() {
    const cartItems = $('#cart #cart-items li[id*="cart-items-item"]');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};

      const name = itemElement.find('.product-title .cart-item-name');
      item.id = name.data('s-object-id');
      item.name = name.text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.cart-item-image img').attr('src');
      item.link = location.hostname + name.attr('href');
      item.quantity = parseInt(itemElement.find('.quantity-select input').val(), 10);

      const priceString = itemElement.find('.product-price').text()
        .replace(/[a-z]{1,}|:/gi, '')
        .replace(/\$|£|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

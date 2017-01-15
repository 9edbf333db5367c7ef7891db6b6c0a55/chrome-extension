export default {
  name: 'walmart',
  host: 'https://www.walmart.com',
  cartPath: '/cart',
  scraper() {
    const cartItems = $('.cart-list.cart-list-active .cart-item-row > .cart-item-row');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('.js-btn-product.btn-fake-link').data('us-item-id');
      item.name = itemElement.find('.js-btn-product').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();
      item.quantity = parseInt(itemElement.find('.chooser-option-current').text(), 10);

      const priceString = itemElement.find('.Price span').text().replace(/\$|,|\s/g, '');
      item.price = parseFloat(priceString, 10);
      item.image = itemElement.find('.asset-container img').attr('src');
      item.link = encodeURI('https://www.walmart.com/search/?query=' + item.name);
      return item;
    });
  },
};

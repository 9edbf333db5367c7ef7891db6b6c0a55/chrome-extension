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

      item.image = itemElement.find('.asset-container img').attr('src');
      item.link = encodeURI('https://www.walmart.com/search/?query=' + item.name);
      let quantity = itemElement.find('.Cart-Common-QuantitySelector.quantity-selector select');
      if (!quantity.val()) {
        quantity = itemElement.find('.cart-item-quantity span:last-child span:last-child');
        quantity = quantity.text().trim().replace(/:|\s/g, '');
      }
      item.quantity = parseInt(quantity && quantity.val ? quantity.val() : quantity, 10);

      const priceString = itemElement.find('.Price > span').text().replace(/\$|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

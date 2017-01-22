export default {
  name: 'everything5pounds',
  host: 'https://www.everything5pounds.com/en/',
  cartPath: '/en/cart',
  scraper() {
    const cartItems = $('.row .cart-summary .cart form.cart-quantity');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('input[name^="productCode"]').val();
      item.name = itemElement.find('h3.itemName a').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.cart-item .thumb a img').attr('src');
      item.link = location.hostname + itemElement.find('h3.itemName a').attr('href');
      item.quantity = parseInt(itemElement.find('.quantity .qty').text(), 10);

      const attrWrapper = itemElement.find('.selected-params .col > .row');
      if (attrWrapper.length) {
        item.color = attrWrapper.first().find('.item-param').text().trim();
        if (attrWrapper.filter('[class*="option"]').length > 1) {
          item.size = attrWrapper.first().next('[class*="option"]').find('.item-param').text();
          item.size = item.size.replace(/(size)/gi, '').trim();
        }
      }

      const priceString = itemElement.find('.total-item-price').text().replace(/\$|£|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

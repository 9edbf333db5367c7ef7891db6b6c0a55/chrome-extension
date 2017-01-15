export default {
  name: 'Amazon',
  host: 'https://www.amazon.com',
  cartPath: '/gp/cart/view.html/ref=nav_cart',
  scraper() {
    // .not(...) removes items that are in wish list/saved for later
    const cartItems = $('#sc-active-cart .sc-list-body .sc-list-item')
      .not('.sc-action-move-to-cart');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.data('itemid');
      item.name = itemElement.find('.sc-product-link .sc-product-title').first().text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('img.sc-product-image').attr('src');
      item.link = itemElement.find('.sc-product-link').attr('href');

      const dropdown = itemElement.find('.a-dropdown-prompt');
      if (dropdown.length >= 1 || (dropdown.text() && dropdown.text().indexOf('10+') === -1)) {
        item.quantity = parseInt(dropdown.text(), 10);
      } else {
        item.quantity = parseInt(itemElement.find('input.sc-quantity-textfield').val(), 10);
      }

      const priceString = itemElement.find('.sc-product-price').text().replace(/\$|,|\s/g, '');
      if (priceString.indexOf('£') > -1) {
        item.priceInPounds = true;
      }

      item.price = parseFloat(priceString, 10);
      return item;
    });
  },
};

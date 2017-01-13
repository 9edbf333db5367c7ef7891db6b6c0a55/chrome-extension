export default {
  name: 'Amazon',
  host: 'https://www.amazon.com',
  cartPath: '/gp/cart/view.html/ref=nav_cart',
  scraper() {
    // .not(...) removes items that are in wish list/saved for later
    const cartItems = $('#sc-active-cart .sc-list-body .sc-list-item')
      .not('.sc-action-move-to-cart');

    return cartItems.map(function itemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.data('itemid');
      item.name = itemElement.find('.sc-product-link .sc-product-title').first().text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      const dropdown = itemElement.find('.a-dropdown-prompt');
      if (dropdown.length >= 1 || (dropdown.text() && dropdown.text().indexOf('10+') === -1)) {
        item.quantity = parseInt(dropdown.text(), 10);
      } else {
        item.quantity = parseInt(itemElement.find('input.sc-quantity-textfield').val(), 10);
      }

      const priceString = itemElement.find('.sc-product-price').text().replace(/\$|,|\s/g, '');
      item.price = parseFloat(priceString, 10);
      item.image = itemElement.find('img.sc-product-image').attr('src');
      item.link = itemElement.find('.sc-product-link').attr('href');
      return item;
    });
  },
};

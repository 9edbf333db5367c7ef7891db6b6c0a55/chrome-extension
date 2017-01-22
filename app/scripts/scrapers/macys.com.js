export default {
  name: 'macys',
  host: 'https://www.macys.com',
  cartPath: '/bag/index.ognc?cm_sp=navigation-_-top_nav-_-bag',
  scraper() {
    const cartItems = $('.bagContent .lineItem');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('.valWebId').text();
      item.name = itemElement.find('.productName').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.productImage').attr('src');
      item.link = itemElement.find('.productName').attr('href');
      item.quantity = parseInt(itemElement.find('.selectQty > option[selected]').text(), 10);

      if (itemElement.find('span.valColor')) {
        item.color = itemElement.find('span.valColor').text();
      }

      if (itemElement.find('span.valSize')) {
        item.size = itemElement.find('span.valSize').text();
      }

      const priceString = itemElement.find('.itemTotal').text().replace(/\$|,|\s|(USD)/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;

      return item;
    });
  },
};

export default {
  name: 'bathandbodyworks',
  host: 'https://www.bathandbodyworks.com',
  cartPath: '/cart/index.jsp',
  scraper() {
    const cartItems = $('table.item-table tbody tr');

    if (cartItems.closest('table.item-table').attr('class').indexOf('no-items') > -1) {
      return [];
    }

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('.product-details dl dd:last-child').text().trim();
      item.name = itemElement.find('.product-details h4 a').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = location.hostname + itemElement.find('.product-image img').attr('src');
      item.link = location.hostname + itemElement.find('.product-details h4 a').attr('href');
      item.quantity = parseInt(itemElement.find('.quantity input').val(), 10);

      if (itemElement.find('dl dd:nth-child(2)').length) {
        item.size = itemElement.find('dl dd:nth-child(2)').text().trim().replace(/\.|\s/g, '');
      }

      let priceString;
      if (itemElement.find('.price').children('.nowPrice').length) {
        const currentPrice = itemElement.find('.price .nowPrice').text();
        priceString = currentPrice.indexOf('FREE') > -1 ? '0.00' : currentPrice;
        item.name = currentPrice.indexOf('FREE') > -1 ? `${item.name} -- FREE ITEM` : item.name;
      } else {
        priceString = itemElement.find('.price').text();
      }

      item.price = parseFloat(priceString.replace(/\$|£|,|\s/g, ''), 10);
      return item;
    });
  },
};

export default {
  name: 'hm',
  host: 'https://www.hm.com/us/',
  cartPath: '/us/bag',
  headerBarEl: '.l-header',
  scraper() {
    const cartItems = $('.shoppingbag-items ul#bagProducts > li');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('.btn.quicklook').data('product');
      item.name = itemElement.find('div:first-child h2').text();
      item.name = item.name.replace(/("|\n(\r)?)|\s{2,}|\$[0-9]{1,}(\.[0-9]{1,})?/g, '').trim();

      item.image = itemElement.find('.imageItem a img').attr('src');
      item.link = itemElement.find('.imageItem a').attr('href').trim();
      item.quantity = parseInt(itemElement.find('ul > li.qty span.qty-value').text(), 10);

      if (itemElement.find('ul > li.color select').length) {
        item.color = itemElement.find('ul > li.color select > option[selected]').text().trim();
      }

      if (itemElement.find('ul > li.size select').length) {
        item.size = itemElement.find('ul > li.size select > option[selected]').text();
        item.size = item.size.replace(/\s{2,}|\n(\r)?|(size)/gi, '').trim();
      }

      const priceString = itemElement.find('.priceTotal .price').text().replace(/\$|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

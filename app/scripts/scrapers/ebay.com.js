export default {
  name: 'ebay',
  host: 'https://www.ebay.com',
  cartPath: 'http://cart.payments.ebay.com/sc/view',
  scraper() {
    const cartItems = $('#ShopCart .c-std > .fl.col_100p');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('.sci-itmttl a').attr('href').split('/').splice(-1)[0];
      if (item.id.indexOf('?') > -1) {
        const variation = item.id.split('?');
        item.id = variation[0];
        item.variationId = variation[1].replace(/(\?)?(var=)/gi, '');
      }

      item.name = itemElement.find('.sci-itmttl a').text().trim();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.imganchor img').attr('src');
      item.link = itemElement.find('.sci-itmttl a').attr('href');
      item.quantity = parseInt(itemElement.find('input.qtyTextBox').val(), 10);

      const priceString = itemElement.find('.prcol140 .fw-b').text().replace(/\$|,|\s/g, '');
      item.price = parseFloat(priceString, 10);
      return item;
    });
  },
};

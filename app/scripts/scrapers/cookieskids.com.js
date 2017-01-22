export default {
  name: 'cookieskids',
  host: 'https://www.cookieskids.com',
  cartPath: '/Checkout.aspx',
  scraper() {
    const cartItems = $('.cart-window > .cart-item');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.name = itemElement.find('.right a').text();
      item.name = item.name.replace(/("|\n|”|“)/g, '').trim();

      item.image = location.hostname + '/' + itemElement.find('a.left img').attr('src');
      item.link = itemElement.find('a.left').attr('href');
      item.quantity = parseInt(itemElement.find('.right input').val(), 10);

      const attrWrapper = itemElement.find('.right > span');
      attrWrapper.forEach((elem) => {
        let value = $(elem).text().split(/#|:/)[1].trim();
        const attr = $(elem).attr('class').replace(/(clear|left|item|each|red|-)/g, '').trim();

        value = /\$[0-9]+(\.[0-9]+)?/.test(value) ?
          parseFloat(value.replace(/\$|£|,|\s/g, ''), 10) : value;
        item[attr.replace('skunumber', 'id')] = value;
      });

      return item;
    });
  },
};

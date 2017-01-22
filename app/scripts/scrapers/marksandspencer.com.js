export default {
  name: 'marksandspencer',
  host: 'https://www.marksandspencer.com',
  cartPath: '/OrderCalculate',
  scraper() {
    const cartItems = $('.content__inner .product-item--separated.product-item--basket');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      item.id = itemElement.find('p[ng-bind*="item.productCode"]').text();
      item.name = itemElement.find('a.product-item__link').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.product-item__img').attr('src');
      item.link = location.hostname + itemElement.find('a.product-item__link').attr('href');

      const quantity = itemElement.find('.product-item__quantity select > option[selected]').text();
      item.quantity = parseInt(quantity, 10);

      let attributes = itemElement.find('.product-item__detail[ng-bind-html*="productAttributes"]');
      if (attributes.length) {
        attributes = attributes.text().trim().split(',');
        if (attributes.length > 0) item.color = attributes[0].trim();
        if (attributes.length > 1) item.size = attributes[1].trim();
      }

      const priceString = itemElement.find('.product-item__subtotal > p').text();
      item.price = parseFloat(priceString.replace(/\$|£|,|\s/g, ''), 10) / item.quantity;
      return item;
    });
  },
};

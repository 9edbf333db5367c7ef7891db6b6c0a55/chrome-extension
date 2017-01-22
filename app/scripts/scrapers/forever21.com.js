export default {
  name: 'target',
  host: 'https://www.target.com',
  cartPath: '/Checkout/Basket.aspx?br=f21',
  scraper() {
    const cartItems = $('#checkout_shoppingbag .itemlist[id*="divCartItem"]');

    return cartItems.map(function cartItemLoop() {
      const itemElement = $(this);
      const item = {};
      const link = itemElement.find('.ck_s_itempic a').attr('href');

      item.id = link.split('=').splice(-1)[0];
      item.name = itemElement.find('.s_itemname .item_name_checkout').text();
      item.name = item.name.replace(/("|\n)/g, '').trim();

      item.image = itemElement.find('.ck_s_itempic a img').attr('src');
      item.link = location.hostname + link;
      item.quantity = parseInt(itemElement.find('.ck_qty_count').text(), 10);

      item.color = itemElement.find('div > ul:nth-child(1) > li:nth-child(2)').text().trim();
      item.size = item.size = itemElement.find('div > ul:nth-child(2) > li:nth-child(2)').text().trim();

      const priceString = itemElement.find('.subtotals').text().replace(/\$|,|\s/g, '');
      item.price = parseFloat(priceString, 10) / item.quantity;
      return item;
    });
  },
};

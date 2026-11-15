export const restaurantImages = {
  1: require('../../assets/menu/burger.jpg'),
  2: require('../../assets/menu/pizza.jpg'),
  3: require('../../assets/menu/sushi.jpg'),
};

const productImages = {
  1: require('../../assets/menu/burger.jpg'),
  2: require('../../assets/menu/dish.jpg'),
  3: require('../../assets/menu/drink.jpg'),
  4: require('../../assets/menu/pizza.jpg'),
  5: require('../../assets/menu/pizza.jpg'),
  6: require('../../assets/menu/pizza.jpg'),
  7: require('../../assets/menu/sushi.jpg'),
  8: require('../../assets/menu/sushi.jpg'),
  9: require('../../assets/menu/sushi.jpg'),
};

export function getProductImage(productId, establishmentId) {
  return productImages[productId] || restaurantImages[establishmentId] || restaurantImages[1];
}

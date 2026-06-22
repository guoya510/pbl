const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const User = require('../models/User');
const Product = require('../models/Product');

mongoose.connect('mongodb://localhost:27017/campus-second-hand', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  const favorites = await Favorite.find({}).populate('user').populate('product');
  
  const userFavorites = {};
  favorites.forEach(fav => {
    const userId = fav.user?.username || fav.user?._id || 'unknown';
    const productId = fav.product?._id || 'unknown';
    
    if (!userFavorites[userId]) {
      userFavorites[userId] = [];
    }
    userFavorites[userId].push({
      _id: fav._id,
      productId: productId,
      productName: fav.product?.name || 'unknown',
      createdAt: fav.createdAt
    });
  });
  
  console.log('\n=== User Favorites Summary ===');
  Object.keys(userFavorites).forEach(userId => {
    console.log('User:', userId);
    console.log('  Favorites count:', userFavorites[userId].length);
    userFavorites[userId].forEach((fav, idx) => {
      console.log('    ' + (idx + 1) + '. Product: ' + fav.productName + ' (ID: ' + fav.productId + ')');
    });
    console.log('');
  });
  
  await mongoose.disconnect();
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});

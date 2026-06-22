const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');

mongoose.connect('mongodb://localhost:27017/campus-second-hand', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  const favorites = await Favorite.find({}).populate('user').populate('product');
  console.log('Total favorites:', favorites.length);
  
  favorites.forEach(fav => {
    console.log(User:  - Product: );
  });
  
  await mongoose.disconnect();
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});

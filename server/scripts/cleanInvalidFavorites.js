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
  
  let deletedCount = 0;
  
  for (const fav of favorites) {
    if (!fav.product) {
      console.log('Deleting invalid favorite:', fav._id);
      await Favorite.findByIdAndDelete(fav._id);
      deletedCount++;
    }
  }
  
  console.log('\nCleanup completed!');
  console.log('Deleted', deletedCount, 'invalid favorite records');
  
  await mongoose.disconnect();
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});

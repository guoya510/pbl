const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');

mongoose.connect('mongodb://localhost:27017/campus-second-hand', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  const user = await User.findOne({ username: 'admin2' });
  if (!user) {
    console.log('User admin2 not found');
    await mongoose.disconnect();
    process.exit(1);
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret');
  console.log('Generated token for admin2');
  
  const productData = {
    name: 'Test Publish Product',
    description: 'This is a test product',
    price: 99.99,
    category: '电子产品',
    location: '东区宿舍',
    images: []
  };
  
  const newProduct = new Product({
    ...productData,
    seller: user._id
  });
  
  await newProduct.save();
  await newProduct.populate('seller', 'username');
  
  console.log('Product created successfully!');
  console.log('Product:', JSON.stringify(newProduct, null, 2));
  
  await mongoose.disconnect();
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

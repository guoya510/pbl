const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const mongoURI = 'mongodb://localhost:27017/campus-second-hand';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const testProducts = [
  {
    name: 'MacBook Pro 14 M2 Pro',
    description: '2023 MacBook Pro, 14 inch display, M2 Pro chip, 16GB RAM, 512GB SSD. Excellent condition.',
    price: 12999,
    category: 'Electronics',
    location: 'Campus',
    campus: 'East',
    building: 'BuildingA',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'iPhone 15 Pro Max 256GB',
    description: 'iPhone 15 Pro Max, 256GB storage. Like new condition.',
    price: 8999,
    category: 'Electronics',
    location: 'Campus',
    campus: 'West',
    building: 'Lab',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Sony premium noise-cancelling headphones. Used for one year.',
    price: 1599,
    category: 'Electronics',
    location: 'Campus',
    campus: 'South',
    building: 'Art',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Xiaomi Electric Scooter Pro2',
    description: 'Xiaomi electric scooter, max speed 25km/h, range 45km.',
    price: 1299,
    category: 'Transportation',
    location: 'Campus',
    campus: 'North',
    building: 'Complex',
    images: [
      'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'iPad Air 5 256GB WiFi',
    description: 'iPad Air 5, 10.9 inch, M1 chip, 256GB, WiFi only.',
    price: 4599,
    category: 'Electronics',
    location: 'Campus',
    campus: 'East',
    building: 'Dorm1',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Keychron K2 wireless mechanical keyboard, Cherry MX Blue.',
    price: 399,
    category: 'Electronics',
    location: 'Campus',
    campus: 'West',
    building: 'Dorm3',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Exam Study Books',
    description: 'Complete set of graduate exam preparation books.',
    price: 199,
    category: 'Books',
    location: 'Campus',
    campus: 'South',
    building: 'Library',
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'IKEA Bookshelf',
    description: 'IKEA Billy bookshelf, white, 5 shelves.',
    price: 299,
    category: 'Furniture',
    location: 'Campus',
    campus: 'North',
    building: 'Dorm5',
    images: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Canon EOS M50 Camera',
    description: 'Canon EOS M50 Mark II, 15-45mm lens, 24MP.',
    price: 3299,
    category: 'Electronics',
    location: 'Campus',
    campus: 'East',
    building: 'BuildingB',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Ergonomic office chair with lumbar support.',
    price: 1299,
    category: 'Furniture',
    location: 'Campus',
    campus: 'West',
    building: 'Admin',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'AirPods Pro 2',
    description: 'AirPods Pro 2nd generation, USB-C charging case.',
    price: 1299,
    category: 'Electronics',
    location: 'Campus',
    campus: 'South',
    building: 'Dorm4',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Badminton Racket',
    description: 'Yonex NR-D11 badminton racket, strung at 24lbs.',
    price: 199,
    category: 'Sports',
    location: 'Campus',
    campus: 'North',
    building: 'Gym',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop'
    ],
    status: '在售'
  }
];

async function addProducts() {
  try {
    await Product.deleteMany({});
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found');
      process.exit(1);
    }

    const defaultSeller = users[0]._id;

    const productsWithSeller = testProducts.map(product => ({
      ...product,
      seller: defaultSeller
    }));

    const result = await Product.insertMany(productsWithSeller);
    console.log(`Added ${result.length} products`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addProducts();

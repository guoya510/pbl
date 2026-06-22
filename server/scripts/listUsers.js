const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb://localhost:27017/campus-second-hand';

async function fixCreditScore() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('Found ' + users.length + ' users');
    console.log('====================');
    
    let fixedCount = 0;
    for (const user of users) {
      if (user.creditScore < 0 || user.creditScore > 100) {
        const oldScore = user.creditScore;
        user.creditScore = Math.max(0, Math.min(100, user.creditScore));
        user.creditLevel = user.calculateCreditLevel();
        await user.save();
        console.log('Fixed ' + user.username + ': ' + oldScore + ' -> ' + user.creditScore);
        fixedCount++;
      }
    }

    console.log('');
    console.log('Fixed ' + fixedCount + ' users');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixCreditScore();
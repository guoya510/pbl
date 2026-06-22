const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/campus-second-hand').then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    const users = await User.find({}, 'username creditScore creditLevel');
    
    console.log('Before update:');
    users.forEach(u => console.log(u.username + ' ' + u.creditScore + ' ' + u.creditLevel));
    
    for (const user of users) {
      const newLevel = user.creditScore >= 90 ? 'S' :
                       user.creditScore >= 80 ? 'A' :
                       user.creditScore >= 60 ? 'B' :
                       user.creditScore >= 40 ? 'C' : 'D';
      
      if (user.creditLevel !== newLevel) {
        await User.updateOne(
          { _id: user._id },
          { $set: { creditLevel: newLevel } },
          { runValidators: false }
        );
        console.log('Updated ' + user.username + ': ' + user.creditLevel + ' -> ' + newLevel);
      }
    }
    
    console.log('Credit level update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
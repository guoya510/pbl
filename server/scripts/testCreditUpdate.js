const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/campus-second-hand').then(async () => {
  console.log('Connected');
  
  const user = await User.findOne({ username: 'admin' });
  console.log('Before:', user.username, user.creditScore);
  
  const result = await User.findByIdAndUpdate(user._id, {
    $inc: { creditScore: -10 },
    $min: { creditScore: 0 }
  }, { new: true });
  
  console.log('After:', result.username, result.creditScore);
  
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/campus_sell', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  
  const users = await User.find({});
  console.log(Found  users);
  
  for (const user of users) {
    if (user.creditScore < 0 || user.creditScore > 100) {
      console.log(Fixing :  -> );
      user.creditScore = Math.max(0, Math.min(100, user.creditScore));
      user.creditLevel = user.calculateCreditLevel();
      await user.save();
    }
  }
  
  console.log('Credit scores fixed');
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});

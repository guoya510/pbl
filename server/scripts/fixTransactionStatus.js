const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

mongoose.connect('mongodb://localhost:27017/campus-second-hand').then(async () => {
  console.log('Connected');
  
  const result1 = await Transaction.updateMany(
    { status: { $regex: '寰呭' } },
    { status: '待付款' }
  );
  console.log('Updated 待付款:', result1.modifiedCount);
  
  const result2 = await Transaction.updateMany(
    { status: { $regex: '宸插畬' } },
    { status: '已完成' }
  );
  console.log('Updated 已完成:', result2.modifiedCount);
  
  const result3 = await Transaction.updateMany(
    { status: { $regex: '宸插彇' } },
    { status: '已取消' }
  );
  console.log('Updated 已取消:', result3.modifiedCount);
  
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });

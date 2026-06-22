const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/campus_sell', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const testProducts = [
  {
    name: 'MacBook Pro 14 M2 Pro',
    description: '2023款MacBook Pro，14英寸显示屏，M2 Pro芯片，16GB内存，512GB固态硬盘，成色极佳。',
    price: 12999,
    category: '电子产品',
    location: '校区内',
    campus: '东区',
    building: 'A楼',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'iPhone 15 Pro Max 256GB',
    description: 'iPhone 15 Pro Max，256GB存储，几乎全新。',
    price: 8999,
    category: '电子产品',
    location: '校区内',
    campus: '西区',
    building: '实验楼',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '索尼WH-1000XM5耳机',
    description: '索尼顶级降噪耳机，使用一年，功能完好。',
    price: 1599,
    category: '电子产品',
    location: '校区内',
    campus: '南区',
    building: '艺术楼',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '小米电动滑板车Pro2',
    description: '小米电动滑板车，最高时速25km/h，续航45公里。',
    price: 1299,
    category: '交通工具',
    location: '校区内',
    campus: '北区',
    building: '综合楼',
    images: [
      'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'iPad Air 5 256GB WiFi版',
    description: 'iPad Air 5代，10.9英寸，M1芯片，256GB，仅支持WiFi。',
    price: 4599,
    category: '电子产品',
    location: '校区内',
    campus: '东区',
    building: '1号宿舍',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '机械键盘',
    description: 'Keychron K2无线机械键盘，Cherry MX青轴。',
    price: 399,
    category: '电子产品',
    location: '校区内',
    campus: '西区',
    building: '3号宿舍',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '考研复习资料全套',
    description: '完整的考研备考书籍套装，包含数学、英语、政治。',
    price: 199,
    category: '图书教材',
    location: '校区内',
    campus: '南区',
    building: '图书馆',
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '宜家书架',
    description: '宜家Billy书架，白色，5层。',
    price: 299,
    category: '家具',
    location: '校区内',
    campus: '北区',
    building: '5号宿舍',
    images: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '佳能EOS M50相机',
    description: '佳能EOS M50 Mark II，15-45mm镜头，2400万像素。',
    price: 3299,
    category: '电子产品',
    location: '校区内',
    campus: '东区',
    building: 'B楼',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '人体工学办公椅',
    description: '人体工学办公椅，带腰托支撑。',
    price: 1299,
    category: '家具',
    location: '校区内',
    campus: '西区',
    building: '行政楼',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'AirPods Pro 2代',
    description: 'AirPods Pro第二代，USB-C充电盒。',
    price: 1299,
    category: '电子产品',
    location: '校区内',
    campus: '南区',
    building: '4号宿舍',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '羽毛球拍',
    description: '尤尼克斯NR-D11羽毛球拍，24磅拉线。',
    price: 199,
    category: '运动器材',
    location: '校区内',
    campus: '北区',
    building: '体育馆',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '华为MatePad Pro 12.6',
    description: '华为MatePad Pro 12.6英寸，麒麟9000E芯片，8+256GB。',
    price: 5999,
    category: '电子产品',
    location: '校区内',
    campus: '东区',
    building: '教学楼',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'Switch游戏机',
    description: '任天堂Switch OLED版，带多个游戏卡带。',
    price: 2499,
    category: '电子产品',
    location: '校区内',
    campus: '西区',
    building: '2号宿舍',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '显示器支架',
    description: '人体工学显示器支架，支持32寸显示器。',
    price: 399,
    category: '办公用品',
    location: '校区内',
    campus: '南区',
    building: '实验室',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '小米台灯Pro',
    description: '小米台灯Pro，无蓝光伤害，亮度可调。',
    price: 199,
    category: '电子产品',
    location: '校区内',
    campus: '北区',
    building: '6号宿舍',
    images: [
      'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '篮球',
    description: '斯伯丁室外篮球，7号标准球。',
    price: 159,
    category: '运动器材',
    location: '校区内',
    campus: '东区',
    building: '篮球场',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '保温杯',
    description: '虎牌保温杯，容量500ml，保温12小时。',
    price: 199,
    category: '日用品',
    location: '校区内',
    campus: '西区',
    building: '食堂',
    images: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '无线鼠标',
    description: '罗技MX Master 3无线鼠标，蓝牙+优联双模。',
    price: 599,
    category: '电子产品',
    location: '校区内',
    campus: '南区',
    building: '自习室',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '充电宝20000mAh',
    description: '小米移动电源3，20000mAh，支持快充。',
    price: 199,
    category: '电子产品',
    location: '校区内',
    campus: '北区',
    building: '教学楼',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '吉他',
    description: '雅马哈F310木吉他，初学者入门款。',
    price: 899,
    category: '乐器',
    location: '校区内',
    campus: '东区',
    building: '音乐室',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '打印机',
    description: '惠普DeskJet 2720彩色喷墨打印机，支持无线打印。',
    price: 499,
    category: '电子产品',
    location: '校区内',
    campus: '西区',
    building: '打印店',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '暖手宝',
    description: '小米暖手宝，可充电，双面发热。',
    price: 79,
    category: '日用品',
    location: '校区内',
    campus: '南区',
    building: '宿舍',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '收纳盒套装',
    description: '日式收纳盒套装，多种尺寸，塑料材质。',
    price: 59,
    category: '日用品',
    location: '校区内',
    campus: '北区',
    building: '宿舍',
    images: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '计算器',
    description: '卡西欧FX-991CN X科学计算器，支持中文显示。',
    price: 149,
    category: '办公用品',
    location: '校区内',
    campus: '东区',
    building: '考场',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '耳机支架',
    description: '铝合金耳机支架，桌面收纳。',
    price: 59,
    category: '办公用品',
    location: '校区内',
    campus: '西区',
    building: '宿舍',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '折叠桌',
    description: '便携式折叠桌，适合宿舍使用。',
    price: 129,
    category: '家具',
    location: '校区内',
    campus: '南区',
    building: '宿舍',
    images: [
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '台灯',
    description: '可充电LED台灯，三档调光。',
    price: 89,
    category: '电子产品',
    location: '校区内',
    campus: '北区',
    building: '图书馆',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: 'U盘128GB',
    description: '闪迪U盘，128GB，USB3.0高速传输。',
    price: 99,
    category: '电子产品',
    location: '校区内',
    campus: '东区',
    building: '机房',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop'
    ],
    status: '在售'
  },
  {
    name: '瑜伽垫',
    description: '防滑瑜伽垫，厚度8mm。',
    price: 69,
    category: '运动器材',
    location: '校区内',
    campus: '西区',
    building: '健身房',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop'
    ],
    status: '在售'
  }
];

async function addProducts() {
  try {
    const users = await User.find({}, {_id: 1, username: 1});
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`  - ${u.username} (${u._id})`));

    const productsWithUsers = testProducts.map((product, index) => {
      const randomUser = users[index % users.length];
      return {
        ...product,
        seller: randomUser._id,
        sellerName: randomUser.username
      };
    });

    await Product.deleteMany({});
    await Product.insertMany(productsWithUsers);
    console.log(`Added ${productsWithUsers.length} products distributed among users`);
    
    productsWithUsers.forEach(p => {
      const user = users.find(u => u._id.toString() === p.seller.toString());
      console.log(`  ${p.name} - ${user?.username}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addProducts();
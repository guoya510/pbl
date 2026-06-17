const http = require('http');

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

const testProducts = [
  {
    name: '高等数学教材（同济版）',
    description: '第七版上下册，9成新，有少量笔记，适合大二学生学习使用。',
    price: 25,
    category: '教材',
    location: '东区宿舍楼',
    images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400']
  },
  {
    name: '罗技G304无线鼠标',
    description: '使用半年，功能正常，电量充足，赠送一节电池。',
    price: 89,
    category: '电子产品',
    location: '西区图书馆',
    images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=400']
  },
  {
    name: '蓝牙耳机',
    description: '入耳式蓝牙耳机，续航4小时，音质清晰，有充电盒。',
    price: 65,
    category: '电子产品',
    location: '南区宿舍楼',
    images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400']
  },
  {
    name: '篮球',
    description: '斯伯丁7号篮球，9成新，手感好，适合室外和室内使用。',
    price: 45,
    category: '体育用品',
    location: '北区体育馆',
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400']
  },
  {
    name: '台灯',
    description: 'LED护眼台灯，可调节亮度，USB充电，适合宿舍使用。',
    price: 35,
    category: '生活用品',
    location: '东区宿舍楼',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400']
  },
  {
    name: '《活着》余华',
    description: '经典文学作品，9成新，无笔记，适合文学爱好者。',
    price: 18,
    category: '教材',
    location: '西区图书馆',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400']
  },
  {
    name: '小米手环7',
    description: '智能手环，监测心率和睡眠，屏幕完好，腕带有轻微磨损。',
    price: 120,
    category: '电子产品',
    location: '南区宿舍楼',
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400']
  },
  {
    name: '羽毛球拍',
    description: '碳纤维羽毛球拍一对（两支），手感好，适合业余爱好者。',
    price: 80,
    category: '体育用品',
    location: '北区体育馆',
    images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ed?w=400']
  },
  {
    name: '保温杯',
    description: '304不锈钢保温杯，500ml容量，保温效果好，9成新。',
    price: 25,
    category: '生活用品',
    location: '东区宿舍楼',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400']
  },
  {
    name: '《三体》全集',
    description: '科幻小说三体三部曲，共三本，塑封未拆，全新。',
    price: 95,
    category: '教材',
    location: '西区图书馆',
    images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400']
  },
  {
    name: '线性代数教材',
    description: '第五版，9成新，有少量笔记，适合工科学生学习使用。',
    price: 20,
    category: '教材',
    location: '东区宿舍楼',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400']
  },
  {
    name: '机械键盘',
    description: '104键机械键盘，红轴，背光灯效，打字手感好。',
    price: 199,
    category: '电子产品',
    location: '西区图书馆',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400']
  }
];

async function login() {
  const accounts = [
    { username: 'admin1', password: '123456' },
    { username: 'admin2', password: '123456' },
    { username: 'admin', password: 'admin123' }
  ];
  for (const acc of accounts) {
    const res = await request('POST', '/users/login', acc);
    if (res.status === 200 && res.data.token) {
      console.log('使用账户登录成功:', acc.username);
      return res.data.token;
    }
  }
  return null;
}

async function main() {
  console.log('正在登录...');
  const token = await login();
  if (!token) {
    console.log('登录失败，退出');
    return;
  }
  console.log('登录成功！\n开始发布商品...\n');
  let success = 0;
  let fail = 0;
  for (const product of testProducts) {
    const res = await request('POST', '/products', product, token);
    if (res.status === 201) {
      console.log('✓ 已发布: ' + product.name + ' - ¥' + product.price);
      success++;
    } else {
      console.log('✗ 发布失败: ' + product.name, res.data);
      fail++;
    }
  }
  console.log('\n完成！成功: ' + success + '，失败: ' + fail);
}

main();

import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>关于我们</h3>
          <ul>
            <li><a href="#">平台介绍</a></li>
            <li><a href="#">团队成员</a></li>
            <li><a href="#">联系方式</a></li>
            <li><a href="#">加入我们</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>帮助中心</h3>
          <ul>
            <li><a href="#">使用指南</a></li>
            <li><a href="#">常见问题</a></li>
            <li><a href="#">交易流程</a></li>
            <li><a href="#">安全保障</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>服务条款</h3>
          <ul>
            <li><a href="#">用户协议</a></li>
            <li><a href="#">隐私政策</a></li>
            <li><a href="#">免责声明</a></li>
            <li><a href="#">版权声明</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>关注我们</h3>
          <ul>
            <li><a href="#">微信公众号</a></li>
            <li><a href="#">官方微博</a></li>
            <li><a href="#">QQ交流群</a></li>
            <li><a href="#">意见反馈</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 校园二手发布平台 - 让闲置物品焕发新生</p>
      </div>
    </footer>
  );
}

export default Footer;

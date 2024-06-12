// pages/index/index.js
Page({
    data: {
      goods: [
        { id: '1', title: '商品1', image: '/images/image_37.jpg' },
        { id: '2', title: '商品2', image: '/images/image_39.jpg' },
        { id: '3', title: '商品3', image: '/images/0.jpg' }
        // 更多商品...
      ]
    },
    onLoad: function(options) {
      // 页面加载时执行的初始化工作
    },
    viewDetail: function(e) {
      // 处理查看商品详情的逻辑
      console.log('查看商品详情', e.currentTarget.dataset.id);
    },
    navToClassify: function() {
      // 切换到分类页面
      wx.navigateTo({
        url: '/pages/classify/index'
      });
    },
    navToHistory: function() {
      // 切换到历史记录页面
      wx.navigateTo({
        url: '/pages/history/index'
      });
    }

  });
  
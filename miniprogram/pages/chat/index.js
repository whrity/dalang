Page({
  data: {
    inputValue: '',
    dialog: []
  },

  // 输入框内容改变
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    const message = this.data.inputValue;
    if (message.trim() === '') return;

    this.setData({
      dialog: [...this.data.dialog, { type: 'user', content: message }],
      inputValue: ''
    });

    // 调用服务器API发送消息
    this.sendToServer(message);
  },

  // 调用服务器API发送消息
  sendToServer(message) {
    let that = this;
    wx.request({
      url: 'http://172.30.65.7:8081/chat', // 你的服务器调用GLM-4的接口
      method: 'POST',
      data: {
        message: message
      },
      success(res) {
        console.log(res.data);
        that.setData({
          dialog: [...that.data.dialog, { type: 'assistant', content: res.data.reply }]
        });
      }
    });
  }
});


Page({
  data: {
    imagePath: null, // 本地图片路径
    result: "结果即将到来" ,  // 价格预测结果
    uploadStatus: 'none', // 图片上传状态
    uploadError: null, // 图片上传错误信息
    parsedData:null,
  },
  chooseMedia() {
    var that = this;
    wx.chooseMedia({
      count: 1,
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        that.setData({ imagePath: tempFilePath });
        wx.showToast({
          title: '请等待文件上传',
          icon: 'none',
          duration: 2000
        });
        wx.uploadFile({
          url:'http://172.30.65.7:8081/predict',
          filePath: tempFilePath, // 小程序的临时文件路径
          name: 'file',
          success: res => {
            // 上传成功后的操作
            console.log('上传成功', res.data)
            that.setData({ uploadStatus: 'success' }); // 更新上传状态为成功

            wx.showToast({
              title: '图片上传成功',
              icon: 'none',
              duration: 2000
            });
            console.log('模型预测成功', res);
        // 处理返回的预测结果
        this.setData({
          result: res.data
        });
        wx.cloud.uploadFile({
          cloudPath: 'images/' + Date.now() + '.jpg', // 使用时间戳作为文件名
          filePath: tempFilePath,
          success: res => {
            console.log('图片上传成功', res);
            that.setData({ uploadStatus: 'success' }); // 更新上传状态为成功
            // 保存结果到云数据库
            console.log(res.fileID);
            console.log(this.data.result);
            
            wx.cloud.callFunction({ // 从云数据库中获取历史记录
              config:{ env: 'cloud1-4ggr73ha8339fd50' },
              name: 'insertdata',
              data:{
                fileID: this.data.imagePath,
                price: this.data.result
              },
              success: res => {
                  console.log('保存历史记录成功', res.result);
                  this.setData({
                      records: res.result,
                      isloading: false,
                  });
              },
              fail: err => {
                  console.error('保存历史记录失败', err);
                  this.setData({
                      isloading: false,
                  });
              },
          });

          },
          fail: error => {
            console.error('图片上传失败', error);
            that.setData({ uploadError: error });
            that.setData({ uploadStatus: 'failure' }); // 更新上传状态为失败
            wx.showToast({
              title: '图片上传失败，请重新上传',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
            
          
          fail: uploadError => {
            // 上传失败后的操作
            console.error('上传图片失败', uploadError);
            that.setData({ uploadError: uploadError });
            that.setData({ uploadStatus: 'failure' }); // 更新上传状态为失败
            wx.showToast({
              title: '图片上传失败，请重新上传',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: error => {
        // 选择图片失败后的操作
        console.error('选择图片失败', error);
        that.setData({ uploadError: error });
        that.setData({ uploadStatus: 'failure' }); // 更新上传状态为失败
        wx.showToast({
          title: '选择图片失败，请重新上传图片',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  saveResultToCloud: function(openid,fileID, classificationResult) {
    // 保存图片的fileID和分类结果到云数据库
    wx.cloud.callFunction({
      name: "insertdata",
      data: {
        fileID: fileID,
        price: classificationResult
      },
      success: res => {
        console.log('保存记录成功', res);
        wx.showToast({
          title: '记录保存成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: error => {
        console.error('保存记录失败', error);
        wx.showToast({
          title: '记录保存失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
});

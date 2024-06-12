const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const filePath = event.filePath; // 图片文件路径
  console.log('filePath:', filePath);

  // 生成一个随机数作为预测价格
  const prediction = Math.floor(Math.random() * 10000);
  console.log('prediction', prediction);

  return {
    prediction: prediction
  };
};

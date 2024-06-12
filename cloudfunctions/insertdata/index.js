const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

exports.main = async (event, context) => {
    const id = cloud.getWXContext().OPENID; // 获取用户的openid
    const fileID = event.fileID; // 获取图像路径
    const price = event.price; // 获取预测结果
    const date = new Date().toISOString().split('T')[0]; // 获取日期
    try{
        //将数据保存到数据库
        await db.collection('prices').add({
            data: {
                openid: id,
                image: fileID,
                result: price,
                time: date,
            },
        });
        return true;
    }catch(error){
        return error.message;
    }
};
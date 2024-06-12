const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

exports.main = async (event, context) => {
    const id = cloud.getWXContext().OPENID; // 获取用户的openid
    try{
        //从数据库中查询对应用户openid的信息
        const res = await db.collection('prices').where({
            openid: id,
        }).get();
        return res.data;
    }catch(error){
        return error.message;
    }
};
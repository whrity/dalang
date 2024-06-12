const cloud = require('wx-server-sdk');

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
    const id = event.id;
    try{
        await db.collection('prices').doc(id).remove();
        return {
            message: '删除成功！'
        };
    }catch(error){
        console.error(error)
        return {
            message: '删除失败！'  
        };
    }
};
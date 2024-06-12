const getOpenId = require('./getOpenId/index');
const viewrecord = require('./viewrecord.js');
const saverecord = require('./saverecord.js');
const insertdata = require('./insertdata/index');
const viewhistory = require('./viewhistory/index');
const deletehistory = require('./deletehistory/index');

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId.main(event, context);
    case 'saverecord':
      return await saverecord(event, context);
    case 'viewrecord':
      return await viewrecord(event, context);
    case 'viewhistory':
      return await viewhistory(event, context);
    case 'insertdata':
      return await insertdata(event, context);
    case 'deletehistory':
      return await deletehistory(event, context);
  }
};
        

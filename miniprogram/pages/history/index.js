Page({
    data: {
        showmodal: false, // 是否展示提示框
        isloading: true,  // 是否正在加载历史记录
        records: [],      // 需展示的历史记录
        list: [],         // 待删除的历史记录
    },
    
    onShow: function() { // 进入页面时展示历史记录
        this.setData({
            isloading: true,
            list: [],
        });
        this.loadHistory();
    },    

    loadHistory: function() {
        wx.cloud.callFunction({ // 从云数据库中获取历史记录
            name: 'viewhistory',
            success: res => {
                console.log('获取历史记录成功', res.result);
                this.setData({
                    records: res.result,
                    isloading: false,
                });
                if (this.data.records.length == 0) { // 如果没有历史记录则发出提示
                    wx.showToast({
                        title: '暂无历史记录',
                        icon: 'none',
                        duration: 2000
                    });
                    return;
                }
            },
            fail: err => {
                console.error('获取历史记录失败', err);
                this.setData({
                    isloading: false,
                });
            },
        });
    },

    chooseHistory: function(event) {
        const recordId = event.currentTarget.dataset.id; // 获取记录对应在云数据库中的编号
        const index = this.data.list.indexOf(recordId);  // 获取编号在待删除列表中的下标
        console.log(index);
        console.log(recordId);
        if (index != -1) {
            this.data.list.splice(index, 1); // 如果下标存在则移出待删除列表
        }  
        else {
            this.data.list.push(recordId); // 如果下标不存在则加入到待删除列表
        }
    },

    deleteHistory: function() {
        if (this.data.list.length == 0) { // 如果待删除列表为空
            wx.showToast({
                title: '请先选择需要删除的记录',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        this.setData({
            showmodal: true, // 点击删除时，弹出提示框
        });
    },

    confirmDelete: function() {
        this.setData({
            isloading: true,
            showmodal: false,
        });
        var promises = []; // 用于保证先处理完所有异步操作
        for (var i = 0; i < this.data.list.length; i++) { // 遍历待删除列表中的历史记录，逐个删除
            const id = this.data.list[i];
            var promise = new Promise((resolve, reject) =>{
                wx.cloud.callFunction({ // 从云数据库中删除记录
                    name: 'deletehistory',
                    data: {
                        id: id,
                    },
                    success: res => { 
                        console.log('调用云函数成功', res);
                        resolve();
                    },
                    fail: err => {
                        console.error('调用云函数失败', err);
                        reject(err);
                    }
                }); 
            });
            promises.push(promise);
        }
        Promise.all(promises).then(() => { // 只有当所有异步删除操作都执行完毕
            this.setData({
                list: [],
            });
            this.loadHistory();
        }).catch(err => {
            console.error('删除历史记录失败', err);
        });
    },

    cancelDelete: function() {
        this.setData({
            showmodal: false,
        });
    },
});
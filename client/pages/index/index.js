// index.js
Page({
  data: {
    current: 0, // 当前选中的素材
    materials: [{
      projectId: 'at_1798184936285790208', 
      materialId: 'mt_1800856806390882304', 
      materialSrc: '/imgs/10.jpg', 
    }, {
      projectId: 'at_1798184936285790208', 
      materialId: 'mt_1800905123334316032', 
      materialSrc: '/imgs/11.jpg', 
    }],
    result: {}, // 融合结果
  },

  // 切换素材事件
  switchMaterial(event) {
    if (!event || !event.detail) return;
    this.setData({
      current: event.detail.current,
    });
  },

  // 选择照片进行融合
  choose() {
    const self = this;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数
      sizeType: ['compressed'], // 所选的图片的尺寸，这里选择压缩图
      sourceType: ['album', 'camera'], // 选择图片的来源，可从相机和相册
      success({ tempFilePaths }) { // 选择照片接口调用成功的回调函数
        const tempFilePath = tempFilePaths[0];
        console.log('选择照片结果', tempFilePath);
        // 将选择的图片上传
        self.upload(tempFilePath);
      },
      fail: console.error,
    });
  },

  saveImg(tempFilePath) {
    wx.downloadFile({
      url: tempFilePath,
      success (res) {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (res) {
              wx.showToast({
                title: '保存图片成功',
              })
            },
            fail: function (err) {
              wx.showToast({
                title: '保存图片失败' ,
              })
            }
          })
        }
      }
    })
    
  },

  // 下载图片
  download() {
    const self = this;
    const tempFilePath = Object.values(this.data.result)[0];
    console.log(tempFilePath);
    if(tempFilePath !== undefined) {
      this.saveImg(tempFilePath);
    }
    else if(tempFilePath === undefined) {
      wx.showToast({
        title: '先生成再保存哦~',
        icon: 'none',
      });
    }
  },

  // 上传图片方法
  upload(tempFilePath) {
    const self = this;
    wx.showLoading({
      title: '上传中',
      mask: true
    });
    wx.getFileInfo({
      filePath: tempFilePath, // 本地文件路径
      success({ digest, size }) { // 获取图片信息成功的回调函数，digest 为文件的MD5
        // 调用小程序云开发上传图片API
        wx.cloud.uploadFile({
          cloudPath: `faces/${digest}.jpg`, // 云存储路径，图片的目标存储地址
          filePath: tempFilePath, // 本地文件路径
          success({ fileID }) { // fileID 为小程序云开发云存储地址
            console.log('上传照片结果', fileID);
            // 将上传的图片提交融合
            self.submit(fileID);
          },
          fail: self.error,
        });
      },
      fail: self.error,
    });
  },

  // 提交融合图片方法
  submit(fileId) {
    const self = this;
    wx.showLoading({
      title: '融合中',
      mask: true
    });
    const currentMaterial = this.data.materials[this.data.current]; // 当前所选择的素材
    console.log('所选素材', currentMaterial);
    // 调用小程序云开发云函数，提交融合信息
    wx.cloud.callFunction({
      name: 'FaceFusion',
      data: {
        fileId, // 上传的文件云存储地址
        projectId: currentMaterial.projectId, 
        materialId: currentMaterial.materialId, 
      },
      success({ result }) {
        console.log('融合人脸结果', result);
        if (!result || result.code !== 0 || !result.data.Image) return self.error(result); 
        self.data.result[currentMaterial.materialId] = result.data.Image; 
        self.setData({
          result: self.data.result, // 将返回的融合结果赋值给页面数据
        });
        wx.hideLoading(); 
      },
      fail: self.error,
    })
  },

  error(err) {
    console.error(err);
    wx.showToast({
      title: err && err.message ? err.message : '融合失败',
      icon: 'none',
    });
  },
});

const cloud = require('wx-server-sdk'); // 小程序云开发SDK
const TcbService = require('tcb-service-sdk'); // 腾讯云TCB+ SDK
const { SecretId, SecretKey } = require('./config.js'); // 腾讯云秘钥信息

// 云开发初始化
cloud.init({
  env: 'a1-7gpenrvz3f77425f',
});
const tcb = new TcbService(); // 新建一个tcb实例

exports.main = async (event, context) => {
  const {
    fileId, // 上传的文件云存储地址
    projectId, // 当前选择素材对应的腾讯云人脸融合活动ID
  } = event;

  try {
    // 调用云开发API下载在页面上上传的图片
    const { fileContent: fileContentBuffer } = await cloud.downloadFile({
      fileID: fileId
    });
    const fileContent = fileContentBuffer.toString('base64'); // 将图片转换为base64格式

    if (!fileContent) return { code: -2, message: '图片内容为空' }; // 如果图片空，则返回错误

    // 调用 TCB+AI SDK的API，指定进行人脸融合
    const result = await tcb.callService({
      service: 'ai', 
      action: 'FaceFusion', //
      data: {
        ProjectId: projectId, // 活动 ID
        Image: fileContent, // 图片 base64 数据
        RspImgType: 'url', // 返回融合图片格式
      },
      options: {
        secretID: SecretId,
        secretKey: SecretKey
      }
    });

    return result;
  } catch (err) {
    return { code: -1, message: err.message || '云函数错误' };
  }

};

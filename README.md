# FaceFusion
浙江工业大学毕业照人脸融合项目



### 小程序配置

 `project.config.json` 文件， `appid` 为微信开放平台申请到的APPID。



### 服务端配置

 `server/FaceFusion/config.js` 文件中填入腾讯云申请的 `SecretId` 和 `SecretKey` 。

```javascript
module.exports = {
  SecretId: '', // 腾讯云的SecretId
  SecretKey: '', // 腾讯云的SecretKey
};
```

 `server/FaceFusion/index.js` 文件夹，云开发的环境ID。

```javascript
cloud.init({
  env: ''
});
```

配置完成后，将 `server/FaceFusion` 部署至云开发服务。

### 客户端配置

打开 `client/app.js` 文件夹，云开发的环境ID。

```javascript
wx.cloud.init({
  env: ''
});
```


const path = require("path")
const express = require('express');
const app = express();
const port = 3001;

// 设置静态资源目录
const staticDir = path.join(__dirname, 'public');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 允许所有域名跨域
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); // 允许的 HTTP 方法
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 允许的请求头
  next();
});

app.use(express.static(staticDir));

// app.get('/static', (req, res) => {
//   res.send("找到了");
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
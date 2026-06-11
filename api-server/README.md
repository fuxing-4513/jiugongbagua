# 九宫八卦 - 姓名打分 API

独立 Express 服务，提供五格数理姓名打分接口。

## 启动

```bash
cd api-server
npm install
npm start
```

## 接口

```
GET /api/xingming?lastname=李&firstname=嘉欣
```

返回姓名笔画、五格数理、三才配置等数据。

## 部署建议

可用 PM2 或 systemd 管理进程，Nginx 反向代理到 `/api/xingming`。

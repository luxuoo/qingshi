# 宝塔面板部署指南 — 轻食悦膳

## 一、准备工作

### 1. 宝塔面板安装
确保服务器已安装宝塔面板。如未安装，执行：
```bash
# CentOS
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu/Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

### 2. 安装必要软件
登录宝塔面板后，在 **软件商店** 中安装：
- **Nginx**（用于反向代理）
- **MySQL 5.7+** 或 **MySQL 8.0**（数据库）
- **Node.js 版本管理器**（在软件商店搜索 "Node.js" 安装）

---

## 二、上传项目文件

### 方法一：宝塔文件管理器
1. 打开宝塔面板 → **文件**
2. 进入 `/www/wwwroot/` 目录
3. 上传整个 `qingshi` 项目文件夹

### 方法二：Git 拉取
```bash
cd /www/wwwroot/
git clone <你的仓库地址> qingshi
```

---

## 三、配置数据库

### 1. 创建数据库
1. 宝塔面板 → **数据库** → **MySQL** → **添加数据库**
2. 填写：
   - 数据库名：`qingshiyue`
   - 用户名：`qingshiyue`（或自定义）
   - 密码：**设置一个强密码**
   - 访问权限：本地服务器
3. 点击 **提交**

> 也可以直接导入 `server/setup.sql` 来创建数据库（但需要手动创建用户授权）。

---

## 四、配置环境变量

### 1. 创建 `.env` 文件
在服务器上进入项目目录，复制示例文件并编辑：

```bash
cd /www/wwwroot/qingshi/server
cp .env.example .env
```

### 2. 编辑 `.env`
```bash
# 数据库配置（填入第三步创建的数据库信息）
DB_HOST=localhost
DB_USER=qingshiyue
DB_PASSWORD=你的数据库密码
DB_PORT=3306
DB_NAME=qingshiyue

# 服务器端口
PORT=3000

# JWT 密钥（请改为随机字符串，越长越安全）
JWT_SECRET=your_random_secret_at_least_32_chars
```

> **生成随机密钥的方法：**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 五、安装依赖并启动

### 1. 安装 Node.js
```bash
# 使用宝塔的 Node.js 版本管理器安装 Node.js 18+，或手动安装：
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

### 2. 安装项目依赖
```bash
cd /www/wwwroot/qingshi/server
npm install --production
```

### 3. 测试启动
```bash
node index.js
# 看到 "Server running at http://localhost:3000" 表示成功
# 按 Ctrl+C 停止
```

### 4. 使用 PM2 守护进程（推荐）
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
cd /www/wwwroot/qingshi/server
pm2 start index.js --name qingshiyue

# 设置开机自启
pm2 startup
pm2 save

# 常用命令
pm2 status          # 查看状态
pm2 logs qingshiyue # 查看日志
pm2 restart qingshiyue # 重启
pm2 stop qingshiyue    # 停止
```

---

## 六、配置 Nginx 反向代理

### 1. 添加站点
1. 宝塔面板 → **网站** → **添加站点**
2. 填写：
   - 域名：你的域名（如 `qingshi.example.com`）或服务器 IP
   - 根目录：`/www/wwwroot/qingshi`
   - PHP 版本：选择 **纯静态**
3. 点击 **提交**

### 2. 配置反向代理
1. 点击站点名 → **反向代理** → **添加反向代理**
2. 填写：
   - 代理名称：`api`
   - 目标URL：`http://127.0.0.1:3000`
3. 点击 **提交**

### 3. 修改 Nginx 配置（精细控制）
点击站点 → **设置** → **配置文件**，替换为：

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 前端静态文件
    location / {
        root /www/wwwroot/qingshi;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理到 Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /www/wwwroot/qingshi;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

4. 点击 **保存** → **重启 Nginx**

---

## 七、配置防火墙

### 宝塔面板防火墙
1. 宝塔面板 → **安全** → **防火墙**
2. 放行端口：`80`（HTTP）、`443`（HTTPS，如需）

### 云服务器安全组
如果使用阿里云/腾讯云等，还需要在云控制台的安全组中放行 `80` 和 `443` 端口。

---

## 八、访问测试

1. 浏览器访问 `http://你的域名或IP`
2. 应该能看到轻食悦膳首页
3. 测试注册/登录功能
4. 测试发帖/打卡功能

---

## 九、常见问题

### Q: 访问报 "数据库连接失败"
- 检查 `.env` 中数据库密码是否正确
- 检查 MySQL 是否在运行：`systemctl status mysql`
- 检查数据库用户权限：宝塔面板 → 数据库 → 查看用户权限

### Q: 页面能打开但功能不工作（API 报错）
- 检查 Node.js 是否在运行：`pm2 status`
- 检查 Nginx 反向代理配置是否正确
- 查看 Node.js 日志：`pm2 logs qingshiyue`

### Q: 注册/登录提示 "fetch failed"
- 确认通过域名/IP 访问，不是直接打开 HTML 文件
- 检查 Nginx 配置中 `/api/` 代理是否正确
- 检查防火墙是否放行了 3000 端口（内部端口，不需要外部访问）

### Q: 如何配置 HTTPS？
1. 宝塔面板 → 网站 → 设置 → SSL
2. 申请 Let's Encrypt 免费证书
3. 开启强制 HTTPS

### Q: 如何更新代码？
```bash
cd /www/wwwroot/qingshi
git pull
pm2 restart qingshiyue
```

---

## 十、目录结构（部署后）

```
/www/wwwroot/qingshi/
├── index.html              # 前端页面
├── css/                    # 样式文件
├── js/                     # 前端脚本
├── images/                 # 图片资源
├── server/
│   ├── .env                # 环境变量配置（不提交到 git）
│   ├── index.js            # Express 服务器
│   ├── db.js               # 数据库连接
│   └── node_modules/       # 依赖包
└── DEPLOY.md               # 本部署文档
```

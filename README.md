# 轻食悦膳 - 跨端自适应健康食谱Web应用

## 项目简介

轻食悦膳是一款全功能健康食谱类模拟APP，用网页完整复刻原生美食食谱App全部交互场景。采用清新柔和健康风设计，主色调低饱和青柠绿+米白，辅助暖橙，圆角卡片分层设计，动效流畅，界面精致细腻。

## 功能特性

### 核心功能模块
1. **首页模块**：精美轮播banner、每日减脂推荐、热门食谱分类、今日健康饮食打卡、营养数据概览卡片
2. **食谱查询模块**：多条件筛选（减脂/增肌/控糖/养胃/低卡）、食材关键词搜索、菜品收藏、食谱详情页
3. **食材库模块**：各类食材营养参数、热量对照表、食材搭配禁忌、替代食材推荐
4. **饮食计划模块**：自定义一日三餐食谱、7天饮食规划、每日摄入热量目标设置、饮食记录台账
5. **个人中心**：收藏夹、浏览历史、身体数据录入（身高体重BMI）、目标体重设置、偏好饮食标签、深色/浅色模式切换
6. **配套辅助功能**：营养计算器、卡路里换算、饮食小贴士弹窗、一键分享食谱、离线缓存基础数据

### 技术特性
- 100%自适应布局，支持PC、手机、鸿蒙模拟器WebView
- 使用HTML5 + TailwindCSS + JavaScript + ECharts实现
- 纯前端可直接本地打开运行，无需后端
- 深色/浅色模式一键切换
- 图片懒加载，页面加载速度优化
- 兼容WebView内核，无浏览器私有API

## 使用说明

### 1. PC浏览器打开方式

**方法一：直接打开HTML文件**
1. 双击项目中的 `index.html` 文件
2. 浏览器将自动打开应用
3. 推荐使用Chrome、Firefox、Edge等现代浏览器

**方法二：使用本地服务器（推荐）**
1. 安装Node.js（如已安装可跳过）
2. 在项目目录打开终端/命令提示符
3. 运行以下命令启动本地服务器：
   ```bash
   # 使用Python（如已安装）
   python -m http.server 8000
   
   # 或使用Node.js的http-server（需先安装）
   npx http-server -p 8000
   ```
4. 在浏览器中访问 `http://localhost:8000`

### 2. 手机浏览器访问方式

**方法一：局域网访问**
1. 确保手机和电脑连接同一WiFi网络
2. 在电脑上启动本地服务器（参考PC部分）
3. 查看电脑的IP地址（Windows: `ipconfig`，Mac/Linux: `ifconfig`）
4. 在手机浏览器中输入 `http://电脑IP:8000`
   - 例如：`http://192.168.1.100:8000`

**方法二：文件传输**
1. 将整个项目文件夹传输到手机
2. 使用手机文件管理器找到 `index.html` 文件
3. 选择用浏览器打开

**方法三：在线托管**
1. 将项目上传到GitHub Pages、Netlify、Vercel等静态托管平台
2. 获取在线访问链接
3. 在手机浏览器中直接访问

### 3. 嵌入鸿蒙模拟器WebView的配置步骤

#### 步骤1：准备鸿蒙开发环境
1. 下载并安装DevEco Studio（鸿蒙IDE）
2. 下载并安装鸿蒙模拟器（HarmonyOS Emulator）
3. 确保模拟器正常运行

#### 步骤2：创建鸿蒙Web应用项目
1. 打开DevEco Studio
2. 选择"Create Project"
3. 选择模板"Empty Ability"（Stage模型）
4. 配置项目信息：
   - Project name: HealthRecipeApp
   - Bundle name: com.example.healthrecipe
   - Save location: 选择保存路径
   - Compatible API: 根据模拟器版本选择
   - Model: Stage
5. 点击"Finish"创建项目

#### 步骤3：配置Web组件
1. 在 `entry/src/main/ets/pages/Index.ets` 文件中，添加WebView组件：
```typescript
@Entry
@Component
struct Index {
  private webviewController: webview.WebviewController = new webviewController();
  
  build() {
    Column() {
      Web({
        src: 'https://your-app-url.com',  // 替换为你的网页URL
        controller: this.webviewController
      })
      .width('100%')
      .height('100%')
      .javaScriptAccess(true)
      .domStorageAccess(true)
    }
    .width('100%')
    .height('100%')
  }
}
```

#### 步骤4：配置网络权限
1. 在 `entry/src/main/module.json5` 文件中，添加网络权限：
```json
"requestPermissions": [
  {
    "name": "ohos.permission.INTERNET"
  }
]
```

#### 步骤5：本地文件加载（可选）
如果要加载本地HTML文件：
1. 将项目文件放入 `entry/src/main/resources/rawfile/` 目录
2. 修改Web组件的src为本地路径：
```typescript
Web({
  src: 'https://your-app-url.com',
  controller: this.webviewController
})
```

#### 步骤6：运行和调试
1. 连接鸿蒙模拟器或真机
2. 点击Run按钮运行应用
3. 在模拟器中查看应用效果

### 4. 网页封装成鸿蒙应用的基础操作流程

#### 方法一：使用WebView封装（推荐）
1. **创建鸿蒙项目**：按照上述步骤创建项目
2. **配置WebView**：将网页URL配置到WebView组件
3. **添加原生功能**：可以添加启动画面、图标、权限等
4. **签名打包**：在DevEco Studio中配置签名并打包
5. **发布应用**：上传到华为应用市场

#### 方法二：使用快应用引擎
1. **创建快应用项目**：使用华为快应用IDE
2. **配置manifest.json**：
```json
{
  "package": "com.example.healthrecipe",
  "name": "轻食悦膳",
  "versionName": "1.0.0",
  "versionCode": 100,
  "minPlatformVersion": 1070,
  "icon": "/common/icon.png",
  "features": [],
  "permissions": [
    { "origin": "*" }
  ],
  "config": {
    "logLevel": "debug",
    "designWidth": 750
  },
  "router": {
    "entry": "pages/index"
  },
  "display": {
    "titleBarBackgroundColor": "#22c55e",
    "titleBarTextColor": "#ffffff",
    "pages": {
      "pages/index": {
        "titleBarText": "轻食悦膳",
        "titleBar": true
      }
    }
  }
}
```
3. **创建页面**：使用Web组件加载网页
4. **调试和打包**：在IDE中调试并打包

#### 方法三：使用PWA转原生工具
1. **将网页升级为PWA**：添加manifest.json和Service Worker
2. **使用工具转换**：使用PWA Builder等工具转换为原生应用
3. **适配鸿蒙**：调整适配鸿蒙系统特性
4. **签名发布**：签名后发布到应用市场

## 项目结构

```
HealthRecipeApp/
├── index.html          # 主页面文件
├── css/
│   └── style.css       # 自定义样式
├── js/
│   ├── app.js          # 主应用逻辑
│   ├── data.js         # 数据模块
│   └── charts.js       # 图表模块
└── README.md           # 本说明文件
```

## 自定义配置

### 修改主题颜色
在 `index.html` 文件中找到Tailwind配置，修改颜色：
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: {
          // 修改主色调
          500: '#22c55e',  // 主色
          600: '#16a34a',  // 深色
        },
        accent: {
          500: '#f97316',  // 辅助色
        }
      }
    }
  }
}
```

### 添加新食谱数据
在 `js/data.js` 文件中的 `RecipeData` 数组添加新食谱：
```javascript
{
  id: 9,
  name: '新食谱名称',
  category: '分类',
  difficulty: '简单/中等/困难',
  cookingTime: 30,
  calories: 300,
  servings: 2,
  image: '图片URL',
  ingredients: [...],
  nutrition: {...},
  steps: [...],
  tags: [...]
}
```

## 常见问题

### Q: 页面显示不正常怎么办？
A: 请确保使用现代浏览器（Chrome 80+、Firefox 75+、Edge 80+），并检查网络连接（需要加载CDN资源）。

### Q: 图表不显示怎么办？
A: 图表需要ECharts库，请确保网络连接正常，或检查浏览器控制台是否有错误。

### Q: 如何在离线环境使用？
A: 可以将CDN资源下载到本地，并修改HTML文件中的资源引用路径。

### Q: 鸿蒙模拟器中网页显示异常怎么办？
A: 检查WebView组件配置，确保启用了JavaScript和DOM存储权限。

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- 鸿蒙系统内置浏览器

## 许可证

MIT License - 可自由使用和修改
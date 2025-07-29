# 传奇文字游戏 - 部署指南

这是一个基于HTML5的传奇风格文字RPG游戏，支持多种部署方式让其他人可以在线游玩。

## 游戏特色

- 🎮 经典传奇风格的文字RPG游戏
- ⚔️ 丰富的装备系统和套装效果
- 🏆 多种品质的装备（普通、稀有、史诗、传说、神话、超神）
- 💊 药水系统和属性加成
- 📊 完整的角色升级和属性系统

## 本地运行

### 方法1：Python HTTP服务器（推荐）

```bash
# 进入项目目录
cd /path/to/AITestH5

# 启动Python HTTP服务器
python3 -m http.server 8002

# 访问游戏
# 在浏览器中打开：http://localhost:8002/legend-text.html
```

### 方法2：Node.js HTTP服务器

```bash
# 安装http-server（如果没有安装）
npm install -g http-server

# 启动服务器
http-server -p 8002

# 访问游戏
# 在浏览器中打开：http://localhost:8002/legend-text.html
```

## 在线部署方案

### 1. Vercel部署（免费，推荐）

1. 将项目上传到GitHub仓库
2. 访问 [vercel.com](https://vercel.com)
3. 使用GitHub账号登录
4. 点击"New Project"导入GitHub仓库
5. 部署完成后，访问 `https://your-project.vercel.app/legend-text.html`

### 2. Netlify部署（免费）

1. 访问 [netlify.com](https://netlify.com)
2. 拖拽整个项目文件夹到Netlify部署区域
3. 部署完成后，访问 `https://your-site.netlify.app/legend-text.html`

### 3. GitHub Pages部署（免费）

1. 将项目上传到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为源
4. 访问 `https://username.github.io/repository-name/legend-text.html`

### 4. 自有服务器部署

将所有文件上传到你的Web服务器目录，确保Web服务器支持静态文件访问。

## 分享给朋友

部署完成后，你可以将游戏链接分享给朋友：

- **本地分享**：确保朋友在同一局域网内，分享 `http://你的IP地址:8002/legend-text.html`
- **在线分享**：直接分享部署后的在线链接

## 游戏说明

### 基本操作
- 点击"打怪"按钮进行战斗
- 使用药水恢复血量和魔法值
- 装备获得的装备提升属性
- 收集套装获得额外加成

### 装备品质
- 🔘 普通（白色）
- 🔵 稀有（蓝色）
- 🟣 史诗（紫色）
- 🟠 传说（橙色）
- 🔴 神话（红色）
- ⭐ 超神（金色）

### 套装系统
- 永恒套装：2件套+10%攻击力，4件套+20%生命值
- 混沌套装：2件套+15%攻击力，4件套+25%魔法值
- 虚空套装：2件套+20%攻击力，4件套+30%生命值
- 龙神套装：2件套+25%攻击力，4件套+40%生命值
- 神域套装：2件套+30%攻击力，4件套+50%魔法值
- 无限套装：2件套+35%攻击力，4件套+60%生命值
- 创世神套装：2件套+40%攻击力，4件套+80%生命值

## 技术支持

如果遇到问题，请检查：
1. 浏览器是否支持HTML5和JavaScript
2. 网络连接是否正常
3. 服务器是否正常运行

---

享受游戏吧！🎮
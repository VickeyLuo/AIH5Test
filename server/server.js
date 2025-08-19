const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Player = require('./models/Player');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('../')); // 提供静态文件服务

// 数据库连接状态
let isDbConnected = false;
const inMemoryPlayers = new Map(); // 内存存储备用

// MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/legend-game';

if (MONGODB_URI.includes('username:password') || MONGODB_URI.includes('xxxxx')) {
  console.log('⚠️  请配置有效的MongoDB连接字符串');
  console.log('💡 使用内存存储模式（数据不会持久化）');
  isDbConnected = false;
} else {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ 已连接到MongoDB数据库');
    console.log('📊 数据将持久化存储');
    isDbConnected = true;
  })
  .catch((error) => {
    console.error('❌ MongoDB连接失败:', error.message);
    console.log('💡 回退到内存存储模式（数据不会持久化）');
    isDbConnected = false;
  });
}

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'legend-game-secret-key';

// 在线玩家管理
const onlinePlayers = new Map(); // socketId -> playerData
const playerSockets = new Map(); // playerId -> socketId

// 工具函数：生成JWT令牌
function generateToken(playerId) {
  return jwt.sign({ playerId }, JWT_SECRET, { expiresIn: '7d' });
}

// 工具函数：验证JWT令牌
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 工具函数：获取初始游戏状态
function getInitialGameState() {
  return {
    player: {
      class: 'warrior',
      level: 1,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      exp: 0,
      maxExp: 100,
      gold: 100,
      attack: [10, 15],
      defense: 5,
      equipment: {
        weapon: null,
        helmet: null,
        armor: null,
        boots: null,
        ring: null,
        necklace: null,
        special1: null,
        special2: null,
        special3: null,
        special4: null
      },
      inventory: [
        { id: 'health_potion_small', quantity: 5 },
        { id: 'mana_potion_small', quantity: 3 }
      ],
      materials: [
        { id: 'iron_ore', quantity: 10 },
        { id: 'wood', quantity: 15 },
        { id: 'leather', quantity: 8 }
      ],
      cultivation: {
        dropRate: { level: 0, exp: 0 },
        damage: { level: 0, exp: 0 },
        whipCorpse: { level: 0, exp: 0 }
      },
      quests: {
        available: [],
        active: [],
        completed: []
      },
      titles: {
        owned: [],
        current: null,
        scrolls: []
      }
    },
    currentLocation: 1,
    inBattle: false,
    currentMonster: null,
    shopMode: 'buy',
    autoBattle: false,
    showWhipCorpse: false,
    autoRecycle: {
      enabled: false,
      maxQuality: 'common'
    },
    craftingTree: {
      selectedNode: null,
      viewOffset: { x: 0, y: 0 },
      zoomLevel: 1
    }
  };
}

// API路由：用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必填项' });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度必须在3-20个字符之间' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6个字符' });
    }
    
    // 检查用户名是否已存在
    let existingUser = null;
    if (isDbConnected) {
      existingUser = await Player.findOne({ username });
    } else {
      existingUser = inMemoryPlayers.has(username);
    }
    
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let newPlayer;
    if (isDbConnected) {
      // 使用数据库存储
      newPlayer = new Player({
        username,
        password: hashedPassword,
        gameState: getInitialGameState(),
        lastLoginTime: new Date(),
        isOnline: false
      });
      await newPlayer.save();
    } else {
      // 使用内存存储
      const playerId = Date.now().toString();
      newPlayer = {
        _id: playerId,
        username,
        password: hashedPassword,
        gameState: getInitialGameState(),
        createdAt: new Date(),
        lastLoginTime: new Date(),
        isOnline: false
      };
      inMemoryPlayers.set(username, newPlayer);
    }
    
    // 生成令牌
    const token = generateToken(newPlayer._id);
    
    res.status(201).json({
      message: '注册成功',
      token,
      player: {
        id: newPlayer._id,
        username: newPlayer.username
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// API路由：用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    let player = null;
    if (isDbConnected) {
      player = await Player.findOne({ username });
    } else {
      player = inMemoryPlayers.get(username);
    }
    
    if (!player) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, player.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 更新登录时间
    player.lastLoginTime = new Date();
    player.isOnline = true;
    
    if (isDbConnected) {
      await player.save();
    }
    // 内存存储无需额外保存操作
    
    // 生成令牌
    const token = generateToken(player._id);
    
    res.json({
      message: '登录成功',
      token,
      player: {
        id: player._id,
        username: player.username
      },
      gameState: player.gameState
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// API路由：获取排行榜
app.get('/api/rankings', async (req, res) => {
  try {
    const { type = 'level', limit = 50 } = req.query;
    
    let rankings;
    
    if (isDbConnected) {
      // 数据库模式
      let sortCondition;
      switch (type) {
        case 'level':
          sortCondition = { 'gameState.player.level': -1, 'gameState.player.exp': -1 };
          break;
        case 'gold':
          sortCondition = { 'gameState.player.gold': -1 };
          break;
        case 'monsters':
          sortCondition = { 'stats.monstersKilled': -1 };
          break;
        case 'quests':
          sortCondition = { 'stats.questsCompleted': -1 };
          break;
        case 'damage':
          sortCondition = { 'stats.highestDamage': -1 };
          break;
        default:
          sortCondition = { 'gameState.player.level': -1 };
      }
      
      const players = await Player.find({})
        .sort(sortCondition)
        .limit(parseInt(limit))
        .select('username gameState.player.level gameState.player.gold gameState.player.class stats isOnline lastLoginTime');
      
      rankings = players.map(player => ({
        username: player.username,
        gameState: {
          player: {
            level: player.gameState?.player?.level || 1,
            gold: player.gameState?.player?.gold || 0,
            class: player.gameState?.player?.class || 'warrior'
          }
        },
        stats: {
          monstersKilled: player.stats?.monstersKilled || 0,
          questsCompleted: player.stats?.questsCompleted || 0,
          highestDamage: player.stats?.highestDamage || 0
        },
        isOnline: player.isOnline || false,
        lastLoginTime: player.lastLoginTime
      }));
    } else {
      // 内存存储模式
      const allPlayers = Array.from(inMemoryPlayers.values());
      
      let sortedPlayers;
      switch (type) {
        case 'level':
          sortedPlayers = allPlayers.sort((a, b) => {
            const levelDiff = (b.gameState?.player?.level || 0) - (a.gameState?.player?.level || 0);
            if (levelDiff !== 0) return levelDiff;
            return (b.gameState?.player?.exp || 0) - (a.gameState?.player?.exp || 0);
          });
          break;
        case 'gold':
          sortedPlayers = allPlayers.sort((a, b) => (b.gameState?.player?.gold || 0) - (a.gameState?.player?.gold || 0));
          break;
        case 'monsters':
          sortedPlayers = allPlayers.sort((a, b) => (b.stats?.monstersKilled || 0) - (a.stats?.monstersKilled || 0));
          break;
        case 'quests':
          sortedPlayers = allPlayers.sort((a, b) => (b.stats?.questsCompleted || 0) - (a.stats?.questsCompleted || 0));
          break;
        case 'damage':
          sortedPlayers = allPlayers.sort((a, b) => (b.stats?.highestDamage || 0) - (a.stats?.highestDamage || 0));
          break;
        default:
          sortedPlayers = allPlayers.sort((a, b) => (b.gameState?.player?.level || 0) - (a.gameState?.player?.level || 0));
      }
      
      rankings = sortedPlayers.slice(0, parseInt(limit)).map(player => ({
         username: player.username,
         gameState: {
           player: {
             level: player.gameState?.player?.level || 1,
             gold: player.gameState?.player?.gold || 0,
             class: player.gameState?.player?.class || 'warrior'
           }
         },
         stats: {
           monstersKilled: player.stats?.monstersKilled || 0,
           questsCompleted: player.stats?.questsCompleted || 0,
           highestDamage: player.stats?.highestDamage || 0
         },
         isOnline: player.isOnline || false,
         lastLoginTime: player.lastLoginTime
       }));
     }
     
     res.json({
       success: true,
       rankings,
       total: rankings.length
     });
   } catch (error) {
     console.error('获取排行榜失败:', error);
     res.status(500).json({ error: '获取排行榜失败' });
   }
 });
 
 // Socket.io 连接处理
 io.on('connection', (socket) => {
   console.log('客户端连接:', socket.id);
   
   // 认证
   socket.on('authenticate', async (data) => {
     try {
       const { token } = data;
       const decoded = jwt.verify(token, JWT_SECRET);
       
       let player = null;
       if (isDbConnected) {
         player = await Player.findById(decoded.userId);
       } else {
         // 在内存存储中查找玩家
         for (const [username, p] of inMemoryPlayers.entries()) {
           if (p._id === decoded.userId) {
             player = p;
             break;
           }
         }
       }
       
       if (player) {
         socket.userId = decoded.userId;
         socket.username = player.username;
         
         // 更新在线状态
         player.isOnline = true;
         player.lastLoginTime = new Date();
         
         if (isDbConnected) {
           await player.save();
         }
         
         socket.emit('authenticated', {
           success: true,
           player: {
             username: player.username,
             gameState: player.gameState,
             stats: player.stats
           }
         });
       } else {
         socket.emit('authenticated', { success: false, error: '用户不存在' });
       }
     } catch (error) {
       console.error('认证失败:', error);
       socket.emit('authenticated', { success: false, error: '认证失败' });
     }
   });
   
   // 同步游戏状态
   socket.on('sync_game_state', async (data) => {
     try {
       if (!socket.userId) return;
       
       if (isDbConnected) {
         await Player.findByIdAndUpdate(socket.userId, {
           gameState: data.gameState,
           lastSaveTime: new Date()
         });
       } else {
         // 在内存存储中更新
         for (const [username, player] of inMemoryPlayers.entries()) {
           if (player._id === socket.userId) {
             player.gameState = data.gameState;
             player.lastSaveTime = new Date();
             break;
           }
         }
       }
       
       socket.emit('sync_complete', { success: true });
     } catch (error) {
       console.error('同步游戏状态失败:', error);
       socket.emit('sync_complete', { success: false, error: '同步失败' });
     }
   });
   
   // 战斗结果
   socket.on('battle_result', async (data) => {
     try {
       if (!socket.userId) return;
       
       let player = null;
       if (isDbConnected) {
         player = await Player.findById(socket.userId);
       } else {
         for (const [username, p] of inMemoryPlayers.entries()) {
           if (p._id === socket.userId) {
             player = p;
             break;
           }
         }
       }
       
       if (player) {
         if (!player.stats) {
           player.stats = {
             monstersKilled: 0,
             questsCompleted: 0,
             itemsCrafted: 0,
             highestDamage: 0
           };
         }
         
         if (data.victory) {
           player.stats.monstersKilled = (player.stats.monstersKilled || 0) + 1;
         }
         
         if (data.damage && data.damage > (player.stats.highestDamage || 0)) {
           player.stats.highestDamage = data.damage;
         }
         
         if (isDbConnected) {
           await player.save();
         }
       }
       
       socket.emit('battle_result_processed', { success: true });
     } catch (error) {
       console.error('处理战斗结果失败:', error);
       socket.emit('battle_result_processed', { success: false, error: '处理失败' });
     }
   });
   
   // 任务完成
   socket.on('quest_completed', async (data) => {
     try {
       if (!socket.userId) return;
       
       let player = null;
       if (isDbConnected) {
         player = await Player.findById(socket.userId);
       } else {
         for (const [username, p] of inMemoryPlayers.entries()) {
           if (p._id === socket.userId) {
             player = p;
             break;
           }
         }
       }
       
       if (player) {
         if (!player.stats) {
           player.stats = {
             monstersKilled: 0,
             questsCompleted: 0,
             itemsCrafted: 0,
             highestDamage: 0
           };
         }
         
         player.stats.questsCompleted = (player.stats.questsCompleted || 0) + 1;
         
         if (isDbConnected) {
           await player.save();
         }
       }
       
       socket.emit('quest_completed_processed', { success: true });
     } catch (error) {
       console.error('处理任务完成失败:', error);
       socket.emit('quest_completed_processed', { success: false, error: '处理失败' });
     }
   });
   
   // 物品合成
   socket.on('item_crafted', async (data) => {
     try {
       if (!socket.userId) return;
       
       let player = null;
       if (isDbConnected) {
         player = await Player.findById(socket.userId);
       } else {
         for (const [username, p] of inMemoryPlayers.entries()) {
           if (p._id === socket.userId) {
             player = p;
             break;
           }
         }
       }
       
       if (player) {
         if (!player.stats) {
           player.stats = {
             monstersKilled: 0,
             questsCompleted: 0,
             itemsCrafted: 0,
             highestDamage: 0
           };
         }
         
         player.stats.itemsCrafted = (player.stats.itemsCrafted || 0) + 1;
         
         if (isDbConnected) {
           await player.save();
         }
       }
       
       socket.emit('item_crafted_processed', { success: true });
     } catch (error) {
       console.error('处理物品合成失败:', error);
       socket.emit('item_crafted_processed', { success: false, error: '处理失败' });
     }
   });
   
   // 获取在线玩家
   socket.on('get_online_players', async () => {
     try {
       let onlinePlayers;
       
       if (isDbConnected) {
         const players = await Player.find({ isOnline: true })
           .select('username gameState.player.level gameState.player.class')
           .limit(100);
         
         onlinePlayers = players.map(player => ({
           username: player.username,
           level: player.gameState?.player?.level || 1,
           class: player.gameState?.player?.class || 'warrior'
         }));
       } else {
         onlinePlayers = Array.from(inMemoryPlayers.values())
           .filter(player => player.isOnline)
           .slice(0, 100)
           .map(player => ({
             username: player.username,
             level: player.gameState?.player?.level || 1,
             class: player.gameState?.player?.class || 'warrior'
           }));
       }
       
       socket.emit('online_players', { players: onlinePlayers });
     } catch (error) {
       console.error('获取在线玩家失败:', error);
       socket.emit('online_players', { players: [] });
     }
   });
   
   // 断开连接
   socket.on('disconnect', async () => {
     console.log('客户端断开连接:', socket.id);
     
     if (socket.userId) {
       try {
         if (isDbConnected) {
           await Player.findByIdAndUpdate(socket.userId, {
             isOnline: false,
             lastLogoutTime: new Date()
           });
         } else {
           // 在内存存储中更新
           for (const [username, player] of inMemoryPlayers.entries()) {
             if (player._id === socket.userId) {
               player.isOnline = false;
               player.lastLogoutTime = new Date();
               break;
             }
           }
         }
       } catch (error) {
         console.error('更新离线状态失败:', error);
       }
     }
   });
 });
 
 // 启动服务器
 const PORT = process.env.PORT || 8081;
 server.listen(PORT, () => {
   console.log(`服务器运行在端口 ${PORT}`);
 });
const mongoose = require('mongoose');

// 装备子模式
const equipmentSchema = new mongoose.Schema({
  weapon: { type: mongoose.Schema.Types.Mixed, default: null },
  helmet: { type: mongoose.Schema.Types.Mixed, default: null },
  armor: { type: mongoose.Schema.Types.Mixed, default: null },
  boots: { type: mongoose.Schema.Types.Mixed, default: null },
  ring: { type: mongoose.Schema.Types.Mixed, default: null },
  necklace: { type: mongoose.Schema.Types.Mixed, default: null },
  special1: { type: mongoose.Schema.Types.Mixed, default: null },
  special2: { type: mongoose.Schema.Types.Mixed, default: null },
  special3: { type: mongoose.Schema.Types.Mixed, default: null },
  special4: { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false });

// 修炼子模式
const cultivationSchema = new mongoose.Schema({
  dropRate: {
    level: { type: Number, default: 0 },
    exp: { type: Number, default: 0 }
  },
  damage: {
    level: { type: Number, default: 0 },
    exp: { type: Number, default: 0 }
  },
  whipCorpse: {
    level: { type: Number, default: 0 },
    exp: { type: Number, default: 0 }
  }
}, { _id: false });

// 任务子模式
const questsSchema = new mongoose.Schema({
  available: [{ type: mongoose.Schema.Types.Mixed }],
  active: [{ type: mongoose.Schema.Types.Mixed }],
  completed: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false });

// 称号子模式
const titlesSchema = new mongoose.Schema({
  owned: [{ type: String }],
  current: { type: String, default: null },
  scrolls: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false });

// 玩家模式
const playerSchema = new mongoose.Schema({
  // 账户信息
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  
  // 游戏数据
  gameState: {
    player: {
      class: { type: String, default: 'warrior' },
      level: { type: Number, default: 1 },
      hp: { type: Number, default: 100 },
      maxHp: { type: Number, default: 100 },
      mp: { type: Number, default: 50 },
      maxMp: { type: Number, default: 50 },
      exp: { type: Number, default: 0 },
      maxExp: { type: Number, default: 100 },
      gold: { type: Number, default: 100 },
      attack: { type: [Number], default: [10, 15] },
      defense: { type: Number, default: 5 },
      equipment: equipmentSchema,
      inventory: [{
        id: String,
        quantity: Number
      }],
      materials: [{
        id: String,
        quantity: Number
      }],
      cultivation: cultivationSchema,
      quests: questsSchema,
      titles: titlesSchema
    },
    currentLocation: { type: Number, default: 1 },
    inBattle: { type: Boolean, default: false },
    currentMonster: { type: mongoose.Schema.Types.Mixed, default: null },
    shopMode: { type: String, default: 'buy' },
    autoBattle: { type: Boolean, default: false },
    showWhipCorpse: { type: Boolean, default: false },
    autoRecycle: {
      enabled: { type: Boolean, default: false },
      maxQuality: { type: String, default: 'common' }
    },
    craftingTree: {
      selectedNode: { type: mongoose.Schema.Types.Mixed, default: null },
      viewOffset: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
      },
      zoomLevel: { type: Number, default: 1 }
    }
  },
  
  // 统计数据（用于排行榜）
  stats: {
    totalPlayTime: { type: Number, default: 0 }, // 总游戏时间（分钟）
    monstersKilled: { type: Number, default: 0 }, // 击杀怪物数
    questsCompleted: { type: Number, default: 0 }, // 完成任务数
    itemsCrafted: { type: Number, default: 0 }, // 合成物品数
    highestDamage: { type: Number, default: 0 } // 最高伤害
  },
  
  // 在线状态
  isOnline: { type: Boolean, default: false },
  lastLoginTime: { type: Date, default: Date.now },
  lastLogoutTime: { type: Date, default: null },
  
  // 创建和更新时间
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 更新时间中间件
playerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 索引优化
playerSchema.index({ username: 1 });
playerSchema.index({ 'gameState.player.level': -1 });
playerSchema.index({ 'gameState.player.gold': -1 });
playerSchema.index({ 'stats.monstersKilled': -1 });
playerSchema.index({ isOnline: 1 });
playerSchema.index({ lastLoginTime: -1 });

module.exports = mongoose.model('Player', playerSchema);
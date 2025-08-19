# 游戏配置表系统

## 概述

本系统将游戏中的硬编码数值数据改为配置表驱动的方式，提供Excel导表工具支持将Excel表格导出成游戏可以支持的配置表格式。

## 系统架构

### 文件结构
```
├── excel-to-config.html          # Excel导表工具主页面
├── config-manager.js             # 配置管理器类
├── configs/                      # 配置文件目录
│   ├── equipment-config.json     # 装备配置
│   ├── monster-config.json       # 怪物配置
│   ├── item-config.json          # 物品配置
│   ├── craft-config.json         # 合成配方配置
│   └── player-config.json        # 玩家配置
├── config-templates/             # Excel模板文件目录
└── README-CONFIG-SYSTEM.md       # 本文档
```

## 配置表类型

### 1. 装备配置 (equipment-config.json)
包含所有装备数据：
- **武器**: 攻击力、暴击率、暴击伤害等
- **防具**: 防御力、生命值、魔法值等
- **头盔**: 防御力、生命值等
- **靴子**: 防御力、移动速度等
- **饰品**: 戒指、项链等特殊属性
- **特殊装备**: 百分比属性加成

### 2. 怪物配置 (monster-config.json)
包含所有怪物数据：
- 基础属性：生命值、攻击力、防御力
- 奖励：经验值、金币掉落
- 掉落率：不同稀有度物品的掉落概率
- 技能：怪物特殊技能配置

### 3. 物品配置 (item-config.json)
包含所有物品数据：
- **药水**: 生命药水、魔法药水、增益药水
- **材料**: 矿石、草药、特殊材料
- **消耗品**: 卷轴、钥匙等

### 4. 合成配方配置 (craft-config.json)
包含所有合成规则：
- 合成材料需求
- 金币消耗
- 技能要求
- 合成结果

### 5. 玩家配置 (player-config.json)
包含玩家相关数据：
- 初始属性
- 升级需求
- 职业配置
- 技能配置
- 装备槽位

## Excel导表工具使用方法

### 1. 打开导表工具
在浏览器中打开 `excel-to-config.html`

### 2. 上传Excel文件
- 点击上传区域或拖拽Excel文件到页面
- 支持 `.xlsx` 和 `.xls` 格式

### 3. 选择配置表类型
从下拉菜单中选择要生成的配置表类型：
- 装备配置
- 怪物配置
- 物品配置
- 合成配置
- 玩家配置

### 4. 选择工作表
如果Excel文件包含多个工作表，选择要处理的工作表

### 5. 数据预览
系统会显示解析后的数据预览，确认数据正确性

### 6. 导出配置文件
点击"导出配置文件"按钮，下载生成的JSON配置文件

## Excel表格格式要求

### 装备配置表格式
| id | name | type | rarity | price | attack | defense | hp | mp | critRate | critDamage | requirements_level | requirements_class |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
| weapon_001 | 木剑 | weapon | common | 50 | 5-10 | 0 | 0 | 0 | 0 | 0 | 1 | all |

### 怪物配置表格式
| id | name | type | level | hp | attack | defense | exp | gold | dropRate_common | dropRate_rare |
|----|----|----|----|----|----|----|----|----|----|----|----|
| monster_001 | 史莱姆 | common | 1 | 20 | 3-6 | 1 | 5 | 2-5 | 0.3 | 0.05 |

### 物品配置表格式
| id | name | type | subType | rarity | price | effect_type | effect_value | stackable | maxStack |
|----|----|----|----|----|----|----|----|----|----|----|
| potion_001 | 小型生命药水 | potion | hp | common | 20 | heal | 30 | true | 99 |

## 配置管理器使用方法

### 1. 引入配置管理器
```html
<script src="config-manager.js"></script>
```

### 2. 初始化配置管理器
```javascript
const configManager = new ConfigManager();

// 预加载所有配置
await configManager.preloadAll();
```

### 3. 获取配置数据
```javascript
// 获取装备配置
const equipmentConfig = await configManager.getEquipmentConfig();

// 获取特定装备
const weapon = configManager.getEquipmentById('weapon_001');

// 获取怪物配置
const monsterConfig = await configManager.getMonsterConfig();

// 获取特定怪物
const monster = configManager.getMonsterById('monster_001');
```

### 4. 配置验证
```javascript
// 验证配置完整性
const isValid = configManager.validateConfig(configData, 'equipment');
```

## 游戏代码集成

### 1. 替换硬编码数据
将原来的硬编码数据替换为配置读取：

```javascript
// 原来的硬编码方式
const weapon = {
    name: "木剑",
    attack: [5, 10],
    price: 50
};

// 改为配置驱动方式
const weapon = configManager.getEquipmentById('weapon_001');
```

### 2. 动态加载配置
```javascript
// 在游戏初始化时加载配置
async function initGame() {
    await configManager.preloadAll();
    // 其他初始化逻辑
}
```

### 3. 配置热更新
```javascript
// 清除缓存并重新加载配置
configManager.clearCache();
await configManager.preloadAll();
```

## 数据验证规则

### 必填字段验证
- 所有配置项必须包含 `id` 和 `name` 字段
- 装备必须包含 `type` 和 `rarity` 字段
- 怪物必须包含 `level`、`hp`、`attack` 字段

### 数据类型验证
- 数值字段必须为数字类型
- 布尔字段必须为 true/false
- 数组字段必须为有效数组格式

### 引用完整性验证
- 合成配方中的材料ID必须在物品配置中存在
- 怪物技能ID必须在技能配置中存在

## 性能优化

### 1. 配置缓存
- 配置数据在首次加载后会被缓存
- 避免重复的网络请求

### 2. 按需加载
- 支持按类型加载特定配置
- 减少内存占用

### 3. 数据压缩
- JSON配置文件支持gzip压缩
- 减少传输时间

## 错误处理

### 1. 配置文件缺失
- 提供默认配置作为后备
- 记录错误日志

### 2. 数据格式错误
- 详细的错误信息提示
- 数据验证失败时的处理

### 3. 网络错误
- 自动重试机制
- 离线模式支持

## 扩展功能

### 1. 多语言支持
- 配置文件支持多语言字段
- 根据用户语言设置加载对应配置

### 2. 版本控制
- 配置文件包含版本信息
- 支持配置升级和兼容性检查

### 3. 实时编辑
- 开发模式下支持实时编辑配置
- 无需重启游戏即可看到效果

## 注意事项

1. **备份原始数据**: 在使用配置表系统前，请备份原始的硬编码数据
2. **测试验证**: 导入新配置后，请充分测试游戏功能
3. **性能监控**: 监控配置加载对游戏性能的影响
4. **版本兼容**: 确保配置文件版本与游戏代码兼容

## 常见问题

### Q: 如何添加新的配置类型？
A: 在 `config-manager.js` 中添加新的加载方法，并在 `excel-to-config.html` 中添加对应的处理逻辑。

### Q: Excel文件解析失败怎么办？
A: 检查Excel文件格式是否正确，确保列名与配置要求一致。

### Q: 配置文件过大影响性能怎么办？
A: 考虑将大型配置文件拆分为多个小文件，或使用按需加载策略。

### Q: 如何处理配置文件的版本升级？
A: 在配置文件中包含版本号，编写升级脚本处理不同版本间的数据迁移。

---

**开发团队**: 游戏开发组  
**最后更新**: 2024年1月1日  
**版本**: 1.0.0
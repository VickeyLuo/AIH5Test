/**
 * 游戏配置管理器
 * 统一管理所有游戏配置数据，支持缓存和类型安全访问
 */
class ConfigManager {
    constructor() {
        this.configs = new Map();
        this.loadPromises = new Map();
        this.baseUrl = './configs';
        this.fallbackData = this.initFallbackData();
    }

    /**
     * 初始化默认数据（向后兼容）
     */
    initFallbackData() {
        return {
            player: {
                warrior: {
                    hp: 120,
                    mp: 30,
                    attack: 8,
                    defense: 8,
                    skills: {
                        basicSword: { name: '基本剑术', level: 0, maxLevel: 3, mpCost: 0, description: '提升攻击命中率' },
                        attackSword: { name: '攻杀剑术', level: 0, maxLevel: 3, mpCost: 5, description: '强力攻击技能' },
                        halfMoon: { name: '半月弯刀', level: 0, maxLevel: 3, mpCost: 8, description: '扇形范围攻击' },
                        wildSlash: { name: '野蛮冲撞', level: 0, maxLevel: 3, mpCost: 12, description: '冲撞击退敌人' }
                    }
                },
                mage: {
                    hp: 80,
                    mp: 100,
                    attack: 3,
                    defense: 3,
                    skills: {
                        fireball: { name: '火球术', level: 0, maxLevel: 3, mpCost: 10, description: '发射火球攻击敌人' },
                        heal: { name: '治愈术', level: 0, maxLevel: 3, mpCost: 15, description: '恢复生命值' },
                        lightning: { name: '雷电术', level: 0, maxLevel: 3, mpCost: 18, description: '召唤雷电攻击' },
                        magicShield: { name: '魔法盾', level: 0, maxLevel: 3, mpCost: 25, description: '魔法护盾减免伤害' }
                    }
                },
                taoist: {
                    hp: 100,
                    mp: 70,
                    attack: 5,
                    defense: 5,
                    skills: {
                        heal: { name: '治愈术', level: 0, maxLevel: 3, mpCost: 15, description: '恢复生命值' },
                        poison: { name: '施毒术', level: 0, maxLevel: 3, mpCost: 8, description: '给敌人施加毒素' },
                        soulFire: { name: '灵魂火符', level: 0, maxLevel: 3, mpCost: 12, description: '远程火符攻击' },
                        summon: { name: '召唤骷髅', level: 0, maxLevel: 3, mpCost: 30, description: '召唤骷髅战士' }
                    }
                }
            },
            equipment: {
                weapons: [
                    { name: '木剑', attack: [5, 10], critRate: 0, critDamage: 0, price: 50, rarity: 'common' },
                    { name: '铁剑', attack: [10, 18], critRate: 2, critDamage: 10, price: 150, rarity: 'common' },
                    { name: '银剑', attack: [15, 25], critRate: 3, critDamage: 15, price: 300, rarity: 'rare' },
                    { name: '黄金剑', attack: [20, 35], critRate: 5, critDamage: 25, price: 600, rarity: 'epic' },
                    { name: '屠龙刀', attack: [30, 50], critRate: 8, critDamage: 40, price: 1500, rarity: 'legendary' },
                    { name: '法师之杖', attack: [8, 15], critRate: 6, critDamage: 30, magicPower: 20, price: 400, rarity: 'rare', class: 'mage' },
                    { name: '道士法杖', attack: [10, 18], critRate: 4, critDamage: 20, magicPower: 15, price: 350, rarity: 'rare', class: 'taoist' }
                ],
                armors: [
                    { name: '布衣', defense: 2, hp: 0, mp: 0, price: 30, rarity: 'common' },
                    { name: '皮甲', defense: 5, hp: 10, mp: 0, price: 100, rarity: 'common' },
                    { name: '铁甲', defense: 8, hp: 20, mp: 0, critRate: 1, price: 250, rarity: 'rare' },
                    { name: '银甲', defense: 12, hp: 30, mp: 10, critRate: 2, price: 500, rarity: 'epic' },
                    { name: '龙鳞甲', defense: 20, hp: 50, mp: 20, critRate: 4, critDamage: 15, price: 1200, rarity: 'legendary' },
                    { name: '法师长袍', defense: 6, hp: 15, mp: 40, magicPower: 25, price: 300, rarity: 'rare', class: 'mage' },
                    { name: '道士袍', defense: 8, hp: 25, mp: 30, magicPower: 15, price: 280, rarity: 'rare', class: 'taoist' }
                ],
                helmets: [
                    { name: '布帽', defense: 1, hp: 0, mp: 0, price: 20, rarity: 'common' },
                    { name: '皮帽', defense: 3, hp: 5, mp: 0, price: 80, rarity: 'common' },
                    { name: '铁盔', defense: 6, hp: 15, mp: 0, critRate: 1, price: 200, rarity: 'rare' },
                    { name: '银盔', defense: 10, hp: 25, mp: 8, critRate: 2, price: 400, rarity: 'epic' },
                    { name: '龙鳞盔', defense: 15, hp: 40, mp: 15, critRate: 3, critDamage: 10, price: 1000, rarity: 'legendary' },
                    { name: '法师帽', defense: 4, hp: 10, mp: 30, magicPower: 20, price: 250, rarity: 'rare', class: 'mage' },
                    { name: '道士冠', defense: 6, hp: 20, mp: 25, magicPower: 12, price: 230, rarity: 'rare', class: 'taoist' }
                ],
                boots: [
                    { name: '布鞋', defense: 1, hp: 0, mp: 0, price: 15, rarity: 'common' },
                    { name: '皮靴', defense: 2, hp: 5, mp: 0, price: 60, rarity: 'common' },
                    { name: '铁靴', defense: 5, hp: 10, mp: 0, critRate: 1, price: 150, rarity: 'rare' },
                    { name: '银靴', defense: 8, hp: 20, mp: 5, critRate: 2, price: 300, rarity: 'epic' },
                    { name: '龙鳞靴', defense: 12, hp: 30, mp: 10, critRate: 3, critDamage: 8, price: 800, rarity: 'legendary' },
                    { name: '法师靴', defense: 3, hp: 8, mp: 20, magicPower: 15, price: 200, rarity: 'rare', class: 'mage' },
                    { name: '道士靴', defense: 4, hp: 15, mp: 15, magicPower: 10, price: 180, rarity: 'rare', class: 'taoist' }
                ],
                accessories: [
                    { name: '力量戒指', attack: [2, 5], critRate: 3, price: 200, rarity: 'rare', type: 'ring' },
                    { name: '敏捷戒指', critRate: 5, critDamage: 10, price: 250, rarity: 'rare', type: 'ring' },
                    { name: '智慧戒指', mp: 20, magicPower: 15, price: 220, rarity: 'rare', type: 'ring' },
                    { name: '生命项链', hp: 40, defense: 3, price: 300, rarity: 'epic', type: 'necklace' },
                    { name: '暴击项链', critRate: 8, critDamage: 20, price: 400, rarity: 'epic', type: 'necklace' }
                ],
                specialEquipment: [
                    { name: '力量护符', type: 'special', tier: 1, percentDamage: 10, price: 500, rarity: 'rare', description: '增加10%伤害' },
                    { name: '敏捷护符', type: 'special', tier: 1, percentCrit: 5, price: 450, rarity: 'rare', description: '增加5%暴击率' },
                    { name: '智慧护符', type: 'special', tier: 1, percentMagic: 15, price: 550, rarity: 'rare', description: '增加15%魔法伤害' },
                    { name: '生命护符', type: 'special', tier: 1, percentHp: 20, price: 400, rarity: 'rare', description: '增加20%生命值' }
                ],
                potions: [
                    { name: '小血瓶', type: 'hp', heal: 50, price: 20, rarity: 'common' },
                    { name: '中血瓶', type: 'hp', heal: 100, price: 50, rarity: 'common' },
                    { name: '大血瓶', type: 'hp', heal: 200, price: 120, rarity: 'rare' },
                    { name: '小蓝瓶', type: 'mp', heal: 30, price: 15, rarity: 'common' },
                    { name: '中蓝瓶', type: 'mp', heal: 60, price: 40, rarity: 'common' },
                    { name: '大蓝瓶', type: 'mp', heal: 120, price: 100, rarity: 'rare' }
                ]
            },
            monsters: {},
            items: {
                potions: [
                    { name: '小血瓶', type: 'hp', heal: 50, price: 20, rarity: 'common' },
                    { name: '中血瓶', type: 'hp', heal: 100, price: 50, rarity: 'common' },
                    { name: '大血瓶', type: 'hp', heal: 200, price: 120, rarity: 'rare' },
                    { name: '小蓝瓶', type: 'mp', heal: 30, price: 15, rarity: 'common' },
                    { name: '中蓝瓶', type: 'mp', heal: 60, price: 40, rarity: 'common' },
                    { name: '大蓝瓶', type: 'mp', heal: 120, price: 100, rarity: 'rare' }
                ],
                materials: [
                    { name: '铁矿石', rarity: 'common', price: 10, description: '基础合成材料' },
                    { name: '银矿石', rarity: 'rare', price: 30, description: '稀有合成材料' },
                    { name: '黄金矿石', rarity: 'epic', price: 80, description: '史诗合成材料' },
                    { name: '龙鳞片', rarity: 'legendary', price: 200, description: '传说合成材料' },
                    { name: '魔法水晶', rarity: 'rare', price: 50, description: '魔法装备合成材料' },
                    { name: '暗影精华', rarity: 'epic', price: 120, description: '高级合成材料' },
                    { name: '神圣宝石', rarity: 'legendary', price: 300, description: '顶级合成材料' }
                ]
            },
            crafting: {}
        };
    }

    /**
     * 加载配置文件
     * @param {string} configType - 配置类型 (player, equipment, monster, item, crafting)
     * @returns {Promise<Object>} 配置数据
     */
    async loadConfig(configType) {
        // 如果已经在加载中，返回现有的Promise
        if (this.loadPromises.has(configType)) {
            return this.loadPromises.get(configType);
        }

        // 如果已经加载过，直接返回缓存数据
        if (this.configs.has(configType)) {
            return this.configs.get(configType);
        }

        // 创建加载Promise
        const loadPromise = (async () => {
            try {
                const config = await this.fetchConfig(configType);
                this.configs.set(configType, config);
                this.loadPromises.delete(configType);
                return config;
            } catch (error) {
                // 完全静默处理错误，不输出任何信息到控制台
                // 阻止错误冒泡
                this.loadPromises.delete(configType);
                // 返回默认数据，确保数据结构一致
                const fallback = this.fallbackData[configType] || {};
                this.configs.set(configType, fallback);
                return fallback;
            }
        })();

        this.loadPromises.set(configType, loadPromise);
        return loadPromise;
    }

    /**
     * 获取配置文件
     * @param {string} configType - 配置类型
     * @returns {Promise<Object>} 配置数据
     */
    async fetchConfig(configType) {
        try {
            // 特殊处理main-quest配置文件名
            let fileName = `${configType}-config.json`;
            if (configType === 'main-quest') {
                fileName = 'main-quest-config-numeric.json';
            }
            const url = `${this.baseUrl}/${fileName}`;
            
            // 使用fetch API加载配置文件
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const config = await response.json();
            
            if (!config || !config.data) {
                throw new Error('Invalid config format');
            }
            
            return config.data;
        } catch (error) {
            // 完全静默处理所有错误
            // 不向控制台输出任何信息，包括网络错误、解析错误等
            throw new Error(`Config load failed: ${configType}`);
        }
    }

    /**
     * 获取装备数据
     * @param {string} equipmentType - 装备类型 (weapons, armors, helmets, boots, accessories, specialEquipment)
     * @param {string} name - 装备名称（可选）
     * @returns {Promise<Array|Object>} 装备数据
     */
    async getEquipment(equipmentType, name = null) {
        const equipmentConfig = await this.loadConfig('equipment');
        const equipments = equipmentConfig[equipmentType] || [];
        
        if (name) {
            return equipments.find(item => item.name === name) || null;
        }
        
        return equipments;
    }

    /**
     * 获取怪物数据
     * @param {string} area - 地图区域（可选）
     * @param {string} name - 怪物名称（可选）
     * @returns {Promise<Array|Object>} 怪物数据
     */
    async getMonster(area = null, name = null) {
        const monsterConfig = await this.loadConfig('monster');
        
        if (area && monsterConfig[area]) {
            const monsters = monsterConfig[area];
            if (name) {
                return monsters.find(monster => monster.name === name) || null;
            }
            return monsters;
        }
        
        if (name) {
            // 在所有区域中搜索
            for (const areaMonsters of Object.values(monsterConfig)) {
                const monster = areaMonsters.find(m => m.name === name);
                if (monster) return monster;
            }
            return null;
        }
        
        return monsterConfig;
    }

    /**
     * 获取物品数据
     * @param {string} itemType - 物品类型 (potions, materials)
     * @param {string} name - 物品名称（可选）
     * @returns {Promise<Array|Object>} 物品数据
     */
    async getItem(itemType, name = null) {
        const itemConfig = await this.loadConfig('item');
        const items = itemConfig[itemType] || [];
        
        if (name) {
            return items.find(item => item.name === name) || null;
        }
        
        return items;
    }

    /**
     * 获取合成配方
     * @param {string} recipeName - 配方名称（可选）
     * @returns {Promise<Object>} 合成配方数据
     */
    async getCraftingRecipe(recipeName = null) {
        const craftingConfig = await this.loadConfig('crafting');
        
        if (recipeName) {
            return craftingConfig[recipeName] || null;
        }
        
        return craftingConfig;
    }

    /**
     * 获取所有合成配方数据
     * @returns {Promise<Object>} 所有合成配方数据
     */
    async getCraftingRecipes() {
        return await this.loadConfig('crafting');
    }

    /**
     * 获取装备配置
     * @returns {Promise<Object>} 装备配置数据
     */
    async getEquipmentConfig() {
        return await this.loadConfig('equipment');
    }

    /**
     * 获取物品配置
     * @returns {Promise<Object>} 物品配置数据
     */
    async getItemConfig() {
        return await this.loadConfig('item');
    }

    /**
     * 获取怪物配置
     * @returns {Promise<Object>} 怪物配置数据
     */
    async getMonsterConfig() {
        return await this.loadConfig('monster');
    }

    /**
     * 获取合成配置
     * @returns {Promise<Object>} 合成配置数据
     */
    async getCraftingConfig() {
        return await this.loadConfig('crafting');
    }

    /**
     * 获取玩家配置
     * @returns {Promise<Object>} 玩家配置数据
     */
    async getPlayerConfig() {
        return await this.loadConfig('player');
    }

    /**
     * 获取地图配置
     * @returns {Promise<Object>} 地图配置数据
     */
    async getMapConfig() {
        return await this.loadConfig('map');
    }

    /**
     * 获取怪物产出配置
     * @returns {Promise<Object>} 怪物产出配置数据
     */
    async getMonsterDropsConfig() {
        return await this.loadConfig('monster-drops');
    }

    /**
     * 获取主线任务配置
     * @returns {Promise<Object>} 主线任务配置数据
     */
    async getMainQuestConfig() {
        return await this.loadConfig('main-quest');
    }

    /**
     * 根据地图ID获取地图信息
     * @param {string} mapId - 地图ID
     * @returns {Promise<Object|null>} 地图信息
     */
    async getMapById(mapId) {
        const mapConfig = await this.loadConfig('map');
        const maps = mapConfig.maps || [];
        return maps.find(map => map.id === mapId) || null;
    }

    /**
     * 根据地图ID获取该地图的怪物列表
     * @param {string} mapId - 地图ID
     * @returns {Promise<Array>} 怪物列表
     */
    async getMonstersByMap(mapId) {
        const monsterConfig = await this.loadConfig('monster');
        const monsters = monsterConfig.monsters || [];
        return monsters.filter(monster => monster.maps && monster.maps.includes(mapId));
    }

    /**
     * 根据怪物ID获取怪物产出
     * @param {number} monsterId - 怪物ID
     * @returns {Promise<Object|null>} 怪物产出信息
     */
    async getMonsterDrops(monsterId) {
        const dropsConfig = await this.loadConfig('monster-drops');
        return dropsConfig.monsterDrops?.[monsterId] || null;
    }

    /**
     * 计算怪物掉落物品
     * @param {number} monsterId - 怪物ID
     * @returns {Promise<Array>} 掉落物品列表
     */
    async calculateMonsterDrops(monsterId) {
        // 首先从monster配置中获取dropIds引用
        const monsterConfig = await this.loadConfig('monster');
        let monster = null;
        
        // 在所有区域中查找怪物
        for (const area in monsterConfig) {
            const foundMonster = monsterConfig[area].find(m => m.id.toString() === monsterId.toString());
            if (foundMonster) {
                monster = foundMonster;
                break;
            }
        }
        
        if (!monster || !monster.dropIds) return [];
        
        // 使用dropIds作为键从monster-drops配置中获取实际掉落信息
        const dropInfo = await this.getMonsterDrops(monster.dropIds);
        if (!dropInfo || !dropInfo.dropIds) return [];
        
        const drops = [];
        
        // 检查掉落率
        const dropRate = dropInfo.dropRate || 1.0;
        if (Math.random() >= dropRate) return [];
        
        // 解析掉落字符串格式: "gold,3|2001,1|2101,2"
        const dropItems = dropInfo.dropIds.split('|');
        
        for (const dropItem of dropItems) {
            const [itemId, amount] = dropItem.split(',');
            if (itemId && amount) {
                drops.push({
                    id: itemId.trim(),
                    type: this.getItemType(itemId.trim()),
                    amount: parseInt(amount.trim()) || 1
                });
            }
        }
        
        return drops;
    }
    
    /**
     * 根据物品ID获取物品类型
     * @param {string} itemId - 物品ID
     * @returns {string} 物品类型
     */
    getItemType(itemId) {
        // 处理特殊的金币类型
        if (itemId === 'gold') return 'currency';
        
        // 根据数字ID范围判断类型
        const id = parseInt(itemId);
        if (!isNaN(id)) {
            if (id >= 2001 && id <= 2099) return 'consumable'; // 药水类
            if (id >= 2101 && id <= 2199) return 'material';   // 材料类
            if (id >= 2201 && id <= 2299) return 'consumable'; // 消耗品类
            if (id >= 1001 && id <= 1999) return 'equipment';  // 装备类
        }
        
        // 兼容旧的字符串格式
        if (itemId.includes('potion')) return 'consumable';
        if (itemId.includes('ore') || itemId.includes('crystal') || itemId.includes('gel') || itemId.includes('fragment')) return 'material';
        if (itemId.includes('equipment') || itemId.includes('sword') || itemId.includes('dagger') || itemId.includes('axe') || itemId.includes('staff') || itemId.includes('blade')) return 'equipment';
        if (itemId.includes('key')) return 'key';
        if (itemId.includes('book')) return 'skill';
        
        return 'misc';
    }

    /**
     * 获取玩家职业配置
     * @param {string} className - 职业名称 (warrior, mage, taoist)
     * @returns {Promise<Object>} 职业配置数据
     */
    async getPlayerClass(className) {
        const playerConfig = await this.loadConfig('player');
        return playerConfig[className] || this.fallbackData.player[className] || null;
    }

    /**
     * 获取所有配置类型
     * @returns {Array<string>} 配置类型列表
     */
    getConfigTypes() {
        return ['player', 'equipment', 'monster', 'item', 'crafting', 'map', 'monster-drops', 'main-quest'];
    }

    /**
     * 清除缓存
     * @param {string} configType - 配置类型（可选，不传则清除所有）
     */
    clearCache(configType = null) {
        if (configType) {
            this.configs.delete(configType);
            this.loadPromises.delete(configType);
        } else {
            this.configs.clear();
            this.loadPromises.clear();
        }
    }

    /**
     * 重新加载配置
     * @param {string} configType - 配置类型
     * @returns {Promise<Object>} 配置数据
     */
    async reloadConfig(configType) {
        this.clearCache(configType);
        return this.loadConfig(configType);
    }

    /**
     * 预加载所有配置
     * @returns {Promise<void>}
     */
    async preloadAll() {
        const loadPromises = this.getConfigTypes().map(type => this.loadConfig(type));
        await Promise.allSettled(loadPromises);
    }

    /**
     * 获取配置状态
     * @returns {Object} 配置加载状态
     */
    getStatus() {
        const status = {};
        this.getConfigTypes().forEach(type => {
            status[type] = {
                loaded: this.configs.has(type),
                loading: this.loadPromises.has(type)
            };
        });
        return status;
    }

    /**
     * 验证配置数据完整性
     * @param {string} configType - 配置类型
     * @returns {Promise<Object>} 验证结果
     */
    async validateConfig(configType) {
        try {
            const config = await this.loadConfig(configType);
            const result = {
                valid: true,
                errors: [],
                warnings: []
            };

            switch (configType) {
                case 'equipment':
                    this.validateEquipmentConfig(config, result);
                    break;
                case 'monster':
                    this.validateMonsterConfig(config, result);
                    break;
                case 'item':
                    this.validateItemConfig(config, result);
                    break;
                case 'crafting':
                    this.validateCraftingConfig(config, result);
                    break;
                case 'player':
                    this.validatePlayerConfig(config, result);
                    break;
            }

            result.valid = result.errors.length === 0;
            return result;
        } catch (error) {
            return {
                valid: false,
                errors: [error.message],
                warnings: []
            };
        }
    }

    /**
     * 验证装备配置
     */
    validateEquipmentConfig(config, result) {
        const requiredTypes = ['weapons', 'armors', 'helmets', 'boots', 'accessories', 'specialEquipment'];
        requiredTypes.forEach(type => {
            if (!Array.isArray(config[type])) {
                result.errors.push(`Missing or invalid equipment type: ${type}`);
            } else {
                config[type].forEach((item, index) => {
                    if (!item.name) {
                        result.errors.push(`${type}[${index}]: Missing name`);
                    }
                    if (typeof item.price !== 'number' || item.price < 0) {
                        result.warnings.push(`${type}[${index}]: Invalid price`);
                    }
                });
            }
        });
    }

    /**
     * 验证怪物配置
     */
    validateMonsterConfig(config, result) {
        Object.entries(config).forEach(([area, monsters]) => {
            if (!Array.isArray(monsters)) {
                result.errors.push(`Invalid monster data for area: ${area}`);
                return;
            }
            monsters.forEach((monster, index) => {
                if (!monster.name) {
                    result.errors.push(`${area}[${index}]: Missing name`);
                }
                if (!monster.hp || monster.hp <= 0) {
                    result.errors.push(`${area}[${index}]: Invalid hp`);
                }
                if (!monster.level || monster.level <= 0) {
                    result.errors.push(`${area}[${index}]: Invalid level`);
                }
            });
        });
    }

    /**
     * 验证物品配置
     */
    validateItemConfig(config, result) {
        const requiredTypes = ['potions', 'materials'];
        requiredTypes.forEach(type => {
            if (!Array.isArray(config[type])) {
                result.errors.push(`Missing or invalid item type: ${type}`);
            } else {
                config[type].forEach((item, index) => {
                    if (!item.name) {
                        result.errors.push(`${type}[${index}]: Missing name`);
                    }
                });
            }
        });
    }

    /**
     * 验证合成配置
     */
    validateCraftingConfig(config, result) {
        Object.entries(config).forEach(([recipeName, recipe]) => {
            if (!recipe.result) {
                result.errors.push(`Recipe ${recipeName}: Missing result`);
            }
            if (!Array.isArray(recipe.materials)) {
                result.errors.push(`Recipe ${recipeName}: Invalid materials`);
            }
        });
    }

    /**
     * 验证玩家配置
     */
    validatePlayerConfig(config, result) {
        const requiredClasses = ['warrior', 'mage', 'taoist'];
        requiredClasses.forEach(className => {
            if (!config[className]) {
                result.errors.push(`Missing player class: ${className}`);
            } else {
                const classConfig = config[className];
                if (!classConfig.hp || classConfig.hp <= 0) {
                    result.errors.push(`${className}: Invalid hp`);
                }
                if (!classConfig.skills || typeof classConfig.skills !== 'object') {
                    result.warnings.push(`${className}: Missing or invalid skills`);
                }
            }
        });
    }

    /**
     * 获取测试材料数据
     * @returns {Array} 测试材料列表
     */
    getTestMaterials() {
        try {
            // 尝试从测试配置获取
            if (this.configs.has('test')) {
                const testConfig = this.configs.get('test');
                if (testConfig.materials) {
                    return testConfig.materials;
                }
            }
            
            // 从物品配置中获取默认材料
            if (this.configs.has('item')) {
                const itemConfig = this.configs.get('item');
                if (itemConfig.materials && itemConfig.materials.length > 0) {
                    return itemConfig.materials.slice(0, 5).map(material => ({
                        name: material.name,
                        count: Math.floor(Math.random() * 10) + 1,
                        description: material.description || '测试材料'
                    }));
                }
            }
            
            // 返回默认测试材料
            return [
                { name: '铁矿石', count: 5, description: '基础锻造材料' },
                { name: '魔法水晶', count: 3, description: '蕴含魔力的水晶' },
                { name: '银矿石', count: 2, description: '稀有合成材料' }
            ];
        } catch (error) {
            return [];
        }
    }

    /**
     * 获取测试装备数据
     * @returns {Object} 测试装备数据
     */
    getTestEquipment() {
        try {
            // 尝试从测试配置获取
            if (this.configs.has('test')) {
                const testConfig = this.configs.get('test');
                if (testConfig.equipment) {
                    return testConfig.equipment;
                }
            }
            
            // 从装备配置中获取默认装备
            if (this.configs.has('equipment')) {
                const equipmentConfig = this.configs.get('equipment');
                return {
                    weapon: equipmentConfig.weapons && equipmentConfig.weapons[0] ? {
                        ...equipmentConfig.weapons[0],
                        name: '测试' + equipmentConfig.weapons[0].name
                    } : null,
                    helmet: equipmentConfig.helmets && equipmentConfig.helmets[0] ? {
                        ...equipmentConfig.helmets[0],
                        name: '测试' + equipmentConfig.helmets[0].name
                    } : null
                };
            }
            
            // 返回默认测试装备
            return {
                weapon: {
                    name: '测试剑',
                    rarity: 'common',
                    attack: [10, 20]
                },
                helmet: {
                    name: '测试头盔',
                    rarity: 'rare',
                    defense: 5
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * 获取修炼系统配置
     * @returns {Object} 修炼系统配置
     */
    getCultivationConfig() {
        try {
            // 尝试从修炼配置获取
            if (this.configs.has('cultivation')) {
                return this.configs.get('cultivation');
            }
            
            // 返回默认修炼配置
            return {
                initialLevels: {
                    dropRate: { level: 0, exp: 0 },
                    damage: { level: 0, exp: 0 },
                    whipCorpse: { level: 0, exp: 0 }
                },
                upgradeMaterials: {
                    dropRate: [
                        { name: '铁矿石', baseQuantity: 2, levelMultiplier: 1 },
                        { name: '魔法水晶', baseQuantity: 1, levelMultiplier: 0.5 }
                    ],
                    damage: [
                        { name: '铁矿石', baseQuantity: 3, levelMultiplier: 1 },
                        { name: '银矿石', baseQuantity: 1, levelMultiplier: 1 }
                    ],
                    whipCorpse: [
                        { name: '魔法水晶', baseQuantity: 2, levelMultiplier: 1 },
                        { name: '暗影精华', baseQuantity: 1, levelMultiplier: 1 }
                    ]
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * 获取初始游戏状态（用于存档创建和修复）
     * @returns {Object} 初始游戏状态
     */
    getInitialGameState() {
        try {
            // 从默认数据中获取初始状态
            const playerConfig = this.fallbackData.player;
            const itemConfig = this.fallbackData.items;
            
            // 获取战士职业的初始属性
            const warriorClass = playerConfig.warrior;
            
            return {
                player: {
                    class: 'warrior',
                    level: 1,
                    hp: warriorClass.hp,
                    maxHp: warriorClass.hp,
                    mp: warriorClass.mp,
                    maxMp: warriorClass.mp,
                    exp: 0,
                    maxExp: 100,
                    gold: 100,
                    attack: warriorClass.attack,
                    defense: warriorClass.defense,
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
                battleInterval: null,
                showWhipCorpse: false,
                // 自动回收配置
                autoRecycle: {
                    enabled: false,
                    maxQuality: 'common'
                },
                // 合成树数据
                craftingTree: {
                    selectedNode: null,
                    viewOffset: { x: 0, y: 0 },
                    zoomLevel: 1
                }
            };
        } catch (error) {
            console.warn('获取初始游戏状态失败:', error);
            return null;
        }
    }

    /**
     * 检查配置管理器是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isInitialized() {
        return this.configs.size > 0 || this.loadPromises.size > 0;
    }
}

// 创建全局实例
const gameConfig = new ConfigManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigManager, gameConfig };
} else if (typeof window !== 'undefined') {
    window.ConfigManager = ConfigManager;
    window.gameConfig = gameConfig;
}
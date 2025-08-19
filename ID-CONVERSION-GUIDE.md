# 配置文件ID转换指南

本文档记录了游戏配置文件中ID从字符串格式转换为数字格式的规则和映射关系。

## 转换规则

### 装备配置 (equipment-config.json)
- **武器 (weapon_XXX)**: 1-17
- **防具 (armor_XXX)**: 101-112
- **头盔 (helmet_XXX)**: 201-210
- **靴子 (boots_XXX)**: 301-310
- **饰品 (ring_XXX, necklace_XXX)**: 401-406
- **药水 (potion_XXX)**: 501-506
- **材料 (material_XXX)**: 601-605
- **特殊装备 (special_XXX)**: 701-706

### 怪物配置 (monster-config.json)
- **怪物和BOSS (monster_XXX, boss_XXX)**: 1001-1008

### 物品配置 (item-config.json)
- **药水 (potion_XXX)**: 2001-2008
- **材料 (material_XXX)**: 2101-2108
- **消耗品 (scroll_XXX, key_XXX)**: 2201-2203

### 合成配方 (crafting-config.json)
- **配方 (recipe_XXX)**: 3001-3010

## ID映射示例

### 武器
- weapon_001 → 1 (新手剑)
- weapon_002 → 2 (铁剑)
- weapon_017 → 17 (传说之剑)

### 防具
- armor_001 → 101 (布甲)
- armor_002 → 102 (皮甲)
- armor_012 → 112 (龙鳞甲)

### 怪物
- monster_001 → 1001 (小妖精)
- boss_001 → 1007 (火龙王)
- boss_002 → 1008 (古龙)

### 物品
- potion_001 → 2001 (小型生命药水)
- material_001 → 2101 (铁矿石)
- scroll_001 → 2201 (回城卷轴)

### 配方
- recipe_001 → 3001 (铁剑合成)
- recipe_010 → 3010 (装备强化)

## 注意事项

1. 所有ID现在都是数字类型，不再是字符串
2. 不同类型的物品使用不同的ID范围，避免冲突
3. 配方中引用的物品ID也已同步更新
4. 怪物技能中的summonId引用也已更新

## 验证

转换完成后，所有配置文件中不再包含字符串格式的ID（如"weapon_001"），全部使用数字ID。
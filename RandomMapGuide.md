# 🗺️ 随机地图生成系统使用指南

> 受鸠摩智转刀2启发的程序化地图生成系统，为抓鬼游戏提供无限的探索乐趣！

## 🎯 系统概述

这个随机地图生成系统实现了类似鸠摩智转刀2的房间-走廊结构，包含：

- **📦 MapGenerator.ts** - 核心地图生成算法
- **🎨 TileMapRenderer.ts** - 地图可视化渲染器  
- **🎮 GameManager.ts** - 游戏管理和整合

## 🔧 系统特性

### 🏗️ 地图生成特性
- ✅ **房间-走廊系统**：自动生成房间并用走廊连接
- ✅ **最小生成树连接**：确保所有房间都可达
- ✅ **房间类型分化**：出生房间、普通房间、Boss房间
- ✅ **程序化内容**：自动放置敌人、宝箱、障碍物
- ✅ **种子支持**：可重现特定地图布局

### 🎮 游戏功能
- ✅ **WASD/方向键移动**：流畅的8方向移动
- ✅ **碰撞检测**：智能的墙壁碰撞和路径查找
- ✅ **摄像机跟随**：平滑的视角跟随
- ✅ **实时重生成**：按R键生成全新地图
- ✅ **暂停功能**：空格键暂停/恢复

## 📋 集成步骤

### 第一步：场景设置

1. **打开 Main.scene**
2. **创建地图根节点结构**：
   ```
   Main Camera
   Canvas
   ├── GameRoot (Node)
       ├── MapRoot (Node) 
       ├── Player (Node)
       └── UI (Node)
   ```

### 第二步：组件配置

1. **在 GameRoot 上添加组件**：
   - `MapGenerator` 组件
   - `TileMapRenderer` 组件  
   - `GameManager` 组件

2. **设置 MapGenerator 参数**：
   ```typescript
   mapRoot: MapRoot节点
   mapWidth: 50          // 地图宽度
   mapHeight: 50         // 地图高度
   minRooms: 8           // 最少房间数
   maxRooms: 15          // 最多房间数
   minRoomSize: 5        // 最小房间尺寸
   maxRoomSize: 12       // 最大房间尺寸
   cellSize: 32          // 瓦片大小
   ```

3. **配置 TileMapRenderer**：
   ```typescript
   mapGenerator: MapGenerator组件引用
   tileContainer: MapRoot节点
   // 预制体设置（可选，没有会使用彩色方块）
   floorTilePrefab: 地板预制体
   wallTilePrefab: 墙壁预制体
   corridorTilePrefab: 走廊预制体
   spawnPointPrefab: 出生点预制体
   treasureChestPrefab: 宝箱预制体
   normalEnemyPrefab: 普通敌人预制体
   bossEnemyPrefab: Boss预制体
   ```

4. **配置 GameManager**：
   ```typescript
   mapGenerator: MapGenerator组件引用
   mapRenderer: TileMapRenderer组件引用
   player: Player节点
   cameraNode: Main Camera节点
   playerSpeed: 200      // 移动速度
   ```

### 第三步：玩家设置

1. **Player节点添加**：
   - `Sprite` 组件（设置玩家精灵）
   - 设置合适的大小和颜色

2. **摄像机设置**：
   - 调整 Main Camera 的 Z 坐标确保能看到地图
   - 建议设置为 1000

## 🎮 操作说明

### 基础操作
- **WASD** 或 **方向键** - 移动角色
- **R键** - 重新生成地图
- **空格键** - 暂停/恢复游戏

### 调试功能
- 控制台会输出地图生成信息
- 不同颜色的方块代表不同地形：
  - **浅灰色** - 地板
  - **深灰色** - 墙壁  
  - **中灰色** - 走廊
  - **棕色** - 门
  - **绿色** - 出生点
  - **红色** - 敌人
  - **黄色** - 宝箱

## 🔧 自定义扩展

### 1. 添加新房间类型

在 `MapGenerator.ts` 中的 `RoomType` 枚举添加新类型：

```typescript
export enum RoomType {
    NORMAL = 'normal',
    BOSS = 'boss',
    TREASURE = 'treasure',
    SPAWN = 'spawn',
    SECRET = 'secret',
    SHOP = 'shop',        // 新增商店房间
    PUZZLE = 'puzzle'     // 新增解谜房间
}
```

### 2. 自定义地图算法

修改 `generateRooms()` 方法来实现不同的房间布局算法：

```typescript
// 示例：创建线性关卡结构
private generateLinearLevel(): void {
    // 实现线性房间连接逻辑
}

// 示例：创建环形关卡结构  
private generateCircularLevel(): void {
    // 实现环形房间连接逻辑
}
```

### 3. 添加特殊地形

在 `MapCellType` 枚举中添加新地形类型：

```typescript
export enum MapCellType {
    // ... 现有类型
    WATER = 10,        // 水域
    BRIDGE = 11,       // 桥梁
    TRAP = 12,         // 陷阱
    TELEPORTER = 13    // 传送点
}
```

### 4. 实现多层地图

```typescript
// 在MapGenerator中添加
@property({ tooltip: "地图层数" })
currentFloor: number = 1;

public generateMultiFloorMap(floors: number): void {
    for (let i = 0; i < floors; i++) {
        this.currentFloor = i + 1;
        this.generateFloorMap(i);
    }
}
```

## 🚀 高级功能

### 地图种子系统
```typescript
// 使用特定种子生成地图
gameManager.generateNewMap(12345);

// 保存当前地图种子
const currentSeed = mapGenerator.getCurrentSeed();
localStorage.setItem('mapSeed', currentSeed.toString());
```

### 动态难度调整
```typescript
// 根据玩家等级调整房间数量和敌人密度
const playerLevel = 5;
const roomCount = Math.floor(8 + playerLevel * 1.5);
const enemyDensity = 0.3 + playerLevel * 0.1;
```

### 地图存储和加载
```typescript
// 保存地图数据
const mapData = mapGenerator.getMapData();
const roomData = mapGenerator.getRooms();
localStorage.setItem('currentMap', JSON.stringify({mapData, roomData}));

// 加载地图数据
const savedMap = JSON.parse(localStorage.getItem('currentMap'));
mapGenerator.loadMapData(savedMap.mapData, savedMap.roomData);
```

## 🐛 常见问题

### Q1: 地图生成后看不到任何内容
**A:** 检查以下设置：
- MapRoot节点是否正确设置
- 摄像机Z坐标是否合适（建议1000）
- TileMapRenderer是否正确引用了MapGenerator

### Q2: 玩家移动有卡顿
**A:** 调整以下参数：
- 降低 `playerSpeed` 值
- 检查碰撞检测逻辑
- 确保地图数据正确初始化

### Q3: 房间生成失败
**A:** 可能原因：
- `mapWidth/mapHeight` 相对于房间大小太小
- `maxRooms` 设置过高
- 房间重叠检测过于严格

### Q4: 内存占用过高
**A:** 优化建议：
- 启用瓦片对象池
- 限制同时渲染的瓦片数量
- 实现视野裁剪功能

## 🎯 下一步扩展建议

1. **🎨 美术资源集成** - 替换彩色方块为精美的瓦片图片
2. **👾 敌人AI系统** - 为生成的敌人添加智能行为
3. **💎 战利品系统** - 实现宝箱和物品掉落机制
4. **🗝️ 解锁机制** - 添加钥匙和锁门系统
5. **📊 地图统计** - 显示房间访问状态和探索进度
6. **🌟 特殊事件** - 随机事件和隐藏房间
7. **🔊 音效系统** - 为不同区域添加环境音效
8. **💾 存档系统** - 地图进度保存和恢复

---

## 🏆 总结

这个随机地图生成系统为你的抓鬼游戏提供了：

- ✅ **无限可玩性** - 每次都是全新的探索体验
- ✅ **灵活扩展** - 模块化设计易于添加新功能  
- ✅ **性能优化** - 对象池和智能渲染
- ✅ **调试友好** - 丰富的日志和可视化调试

现在你可以按R键生成无数种不同的地图布局，就像鸠摩智转刀2一样享受随机探索的乐趣！🎮✨

# 🎛️ Cocos Creator 中配置随机地图生成系统

## 📋 配置步骤详解

### 第一步：打开场景
1. 在 Cocos Creator 中打开 `assets/scenes/Main.scene`
2. 确保场景层次面板可见

### 第二步：创建节点结构

在 **层次管理器** 中创建以下节点结构：

```
Main Camera
Canvas
├── GameRoot (Node) 
    ├── MapRoot (Node)
    ├── Player (Node) 
    └── UI (Node)
```

**创建方法：**
1. 右键点击 `Canvas` → `创建` → `创建空节点`
2. 重命名为 `GameRoot`
3. 右键点击 `GameRoot` → `创建` → `创建空节点`
4. 分别重命名为 `MapRoot`、`Player`、`UI`

### 第三步：添加组件到 GameRoot

选中 `GameRoot` 节点，在 **属性检查器** 中：

1. **点击 "添加组件" 按钮**
2. **搜索并添加以下组件：**
   - `MapGenerator`
   - `TileMapRenderer` 
   - `GameManager`

### 第四步：配置 MapGenerator 参数

选中 `GameRoot` 节点，在 **属性检查器** 中找到 `MapGenerator` 组件：

#### 🗺️ MapGenerator 参数配置

| 参数名称 | 推荐值 | 说明 |
|---------|-------|------|
| **Map Root** | 拖拽 `MapRoot` 节点 | 地图容器节点 |
| **Map Width** | `50` | 地图宽度（格子数） |
| **Map Height** | `50` | 地图高度（格子数） |
| **Min Rooms** | `8` | 最少房间数量 |
| **Max Rooms** | `15` | 最多房间数量 |
| **Min Room Size** | `5` | 最小房间尺寸 |
| **Max Room Size** | `12` | 最大房间尺寸 |
| **Cell Size** | `32` | 每个瓦片的像素大小 |

**设置方法：**
1. 点击数值框直接输入数字
2. 对于 `Map Root`：从层次管理器拖拽 `MapRoot` 节点到此字段

### 第五步：配置 TileMapRenderer 参数

在同一个 `GameRoot` 节点的 `TileMapRenderer` 组件中：

#### 🎨 TileMapRenderer 参数配置

| 参数名称 | 设置方法 |
|---------|----------|
| **Map Generator** | 选择同节点的 `MapGenerator` 组件 |
| **Tile Container** | 拖拽 `MapRoot` 节点 |
| **Floor Tile Prefab** | (可选) 拖拽地板预制体 |
| **Wall Tile Prefab** | (可选) 拖拽墙壁预制体 |
| **Corridor Tile Prefab** | (可选) 拖拽走廊预制体 |
| **Door Tile Prefab** | (可选) 拖拽门预制体 |
| **Spawn Point Prefab** | (可选) 拖拽出生点预制体 |
| **Treasure Chest Prefab** | (可选) 拖拽宝箱预制体 |
| **Normal Enemy Prefab** | (可选) 拖拽普通敌人预制体 |
| **Boss Enemy Prefab** | (可选) 拖拽Boss预制体 |

**注意：** 预制体都是可选的，如果不设置会使用彩色方块作为调试显示。

### 第六步：配置 GameManager 参数

在同一个 `GameRoot` 节点的 `GameManager` 组件中：

#### 🎮 GameManager 参数配置

| 参数名称 | 设置方法 |
|---------|----------|
| **Map Generator** | 选择同节点的 `MapGenerator` 组件 |
| **Map Renderer** | 选择同节点的 `TileMapRenderer` 组件 |
| **Player** | 拖拽 `Player` 节点 |
| **Camera Node** | 拖拽 `Main Camera` 节点 |
| **Player Speed** | 输入 `200` |

### 第七步：配置玩家节点

选中 `Player` 节点：

1. **添加 Sprite 组件**：
   - 点击 "添加组件" → `渲染组件` → `Sprite`
   - 暂时可以不设置 SpriteFrame，会显示为白色方块

2. **设置玩家大小**：
   - 在 `Transform` 组件中设置 Scale 为 `(0.8, 0.8, 1)`

### 第八步：调整摄像机

选中 `Main Camera` 节点：

1. **设置位置**：
   - Position Z 设置为 `1000`
   - Position X 和 Y 保持 `0`

2. **调整摄像机设置** (可选)：
   - 在 `Camera` 组件中调整 `Ortho Height` 来控制视野大小

## 🎯 完整配置图示

### 节点层次结构
```
📁 Main
├── 📷 Main Camera (Camera组件)
└── 📄 Canvas 
    └── 📦 GameRoot 
        ├── 🔧 MapGenerator 组件
        ├── 🎨 TileMapRenderer 组件  
        ├── 🎮 GameManager 组件
        ├── 🗺️ MapRoot (空节点)
        ├── 👤 Player (Sprite组件)
        └── 🖼️ UI (空节点)
```

### 组件引用关系
```
GameManager 引用：
├── MapGenerator (同节点)
├── TileMapRenderer (同节点)  
├── Player (Player节点)
└── Camera (Main Camera节点)

TileMapRenderer 引用：
├── MapGenerator (同节点)
└── TileContainer (MapRoot节点)

MapGenerator 引用：
└── MapRoot (MapRoot节点)
```

## 🔧 参数调整建议

### 🗺️ 地图大小调整
- **小地图**：`mapWidth: 30, mapHeight: 30, maxRooms: 8`
- **中等地图**：`mapWidth: 50, mapHeight: 50, maxRooms: 15` (推荐)
- **大地图**：`mapWidth: 80, mapHeight: 80, maxRooms: 25`

### 🏠 房间密度调整
- **稀疏布局**：`minRooms: 5, maxRooms: 8`
- **正常布局**：`minRooms: 8, maxRooms: 15` (推荐)
- **密集布局**：`minRooms: 15, maxRooms: 25`

### 📏 房间大小调整
- **小房间**：`minRoomSize: 3, maxRoomSize: 8`
- **中等房间**：`minRoomSize: 5, maxRoomSize: 12` (推荐)
- **大房间**：`minRoomSize: 8, maxRoomSize: 20`

## 🚀 测试运行

配置完成后：

1. **保存场景**：`Ctrl+S`
2. **点击播放按钮** 或按 `Ctrl+P`
3. **测试功能**：
   - 看到彩色方块组成的地图
   - 按 `R` 键重新生成地图  
   - 用 `WASD` 移动白色方块（玩家）
   - 按 `空格` 暂停游戏

## ❗ 常见问题

### Q: 找不到组件
**A:** 确保脚本文件在正确位置：`assets/scripts/managers/`

### Q: 无法拖拽节点到参数
**A:** 确保目标节点类型正确，必要时可以点击参数右边的圆形图标选择

### Q: 游戏运行时报错
**A:** 检查所有必填参数是否都已设置，特别是节点引用

### Q: 看不到地图
**A:** 检查摄像机 Z 坐标是否设置为 1000，MapRoot 是否正确设置

---

完成这些配置后，你就可以在 Cocos Creator 中体验随机地图生成系统了！🎮✨

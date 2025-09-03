# 📸 在Cocos Creator中添加图片详细指南

## 🎯 第一步：导入图片到项目

### 方法一：拖拽导入（推荐）
1. 在电脑中找到您生成的背景图片
2. 直接**拖拽**图片文件到Cocos Creator的 `assets/textures/` 文件夹
3. 等待导入完成（会自动生成.meta文件）

### 方法二：右键导入
1. 右键点击 `assets/textures/` 文件夹
2. 选择 **导入资源**
3. 浏览并选择您的图片文件
4. 点击确定

## 🖼️ 第二步：为Sprite节点设置图片

### 设置背景图片
1. **选中Layer1_Mountains节点**
2. 在属性检查器中找到 **Sprite** 组件
3. 点击 **SpriteFrame** 右边的圆形按钮 🎯
4. 在弹出的资源选择器中选择您的远山背景图
5. 点击确定

### 重复操作其他层
- **Layer2_Fog**: 设置雾气图片
- **Layer3_Plants**: 设置植物图片

## 🔧 第三步：调整图片显示

### 调整尺寸适配
1. 选中背景节点
2. 在 **UITransform** 组件中：
   - 设置 **Content Size** 为 (2048, 1024)
   - 或者点击 **Size Mode** 选择 **Custom**

### 检查图片比例
- 如果图片变形，调整 **Content Size** 的宽高比
- 如果图片模糊，检查原图分辨率

## 📁 建议的文件组织

```
assets/
├── textures/
│   ├── backgrounds/
│   │   ├── layer1_mountains.jpg
│   │   ├── layer2_fog.png
│   │   └── layer3_plants.png
│   └── characters/
│       └── player.png
```

## 🎨 图片格式建议

### 推荐格式
- **远景层**: JPG格式（文件小，无透明需求）
- **中景/近景**: PNG格式（支持透明效果）

### 尺寸建议
- **宽度**: 2048px（循环效果更好）
- **高度**: 1024px（适合横版游戏）
- **比例**: 2:1（标准横版比例）

## ⚡ 常见问题解决

### Q: 图片导入后看不到？
**A:** 
1. 检查文件格式是否支持（JPG、PNG、WEBP等）
2. 刷新资源管理器（右键 → 刷新）
3. 重启Cocos Creator

### Q: 图片显示不全？
**A:** 
1. 调整 **Content Size** 匹配图片尺寸
2. 检查 **Anchor Point** 设置（通常为0.5, 0.5）
3. 确认节点的 **Scale** 值为1

### Q: 图片模糊？
**A:** 
1. 确保原图分辨率足够高
2. 检查 **Filter Mode** 设置（Point为像素风，Linear为平滑）

### Q: 背景不循环？
**A:** 
1. 确保图片左右边缘能无缝连接
2. 检查 **ParallaxBackground** 组件的 **Background Width** 设置

## 🎮 完整设置示例

### Layer1_Mountains 设置：
```
Node: Layer1_Mountains
├── Transform: Position(0, 0, -300)
├── UITransform: Size(2048, 1024)
└── Sprite: SpriteFrame(layer1_mountains.jpg)
```

### Layer2_Fog 设置：
```
Node: Layer2_Fog  
├── Transform: Position(0, 0, -200)
├── UITransform: Size(2048, 1024)
└── Sprite: SpriteFrame(layer2_fog.png)
```

### Layer3_Plants 设置：
```
Node: Layer3_Plants
├── Transform: Position(0, 0, -100)  
├── UITransform: Size(2048, 1024)
└── Sprite: SpriteFrame(layer3_plants.png)
```

## ✅ 验证设置

设置完成后：
1. **场景视图**: 应该看到层叠的背景
2. **预览模式**: 移动角色时背景应该有视差效果
3. **控制台**: 应该没有错误信息

这样您的分层背景就设置完成了！🎨✨

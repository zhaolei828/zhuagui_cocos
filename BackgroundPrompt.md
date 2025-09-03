# 🎨 新手村背景图生成提示词

## 📝 即梦提示词（中文版）

```
新手村背景图，卡通风格，2D横版游戏背景，无缝循环设计，傍晚时分，温暖的橙红色落日，远山连绵起伏，山峰上有银色瀑布飞流直下，天空中飞舞着几只黑色的乌鸦剪影，隐隐薄雾弥漫在山谷间，前景有盘根错节的古老大树，树枝扭曲向上延伸，树下有五彩斑斓的野花，青翠的草地，散落着光滑的石头，整体色调温暖柔和，梦幻卡通画风，平行视角，水平循环无缝拼接，左右边缘可以完美衔接，适合横版卷轴游戏，高清细节，动漫插画风格
```

## 📝 即梦提示词（英文版）

```
Cartoon style village background, 2D side-scrolling game background, seamless horizontal loop design, dusk evening scene, warm orange-red sunset, distant rolling mountains with silver waterfall cascading down, silhouettes of black crows flying in the sky, light misty fog drifting through valleys, foreground with ancient gnarled trees with twisted branches reaching upward, colorful wildflowers beneath trees, lush green grass, scattered smooth stones, warm soft color palette, dreamy cartoon art style, parallel perspective, horizontally tileable seamless pattern, left and right edges perfectly match for infinite scrolling, suitable for side-scrolling games, high detail, anime illustration style, peaceful fantasy atmosphere
```

## 🎯 关键要素说明

### 循环设计要点
- **seamless horizontal loop**: 水平无缝循环
- **tileable pattern**: 可拼接图案
- **left and right edges match**: 左右边缘匹配

### 视觉元素
- **远景**: 连绵远山 + 瀑布 + 落日
- **中景**: 薄雾 + 飞鸟剪影
- **近景**: 古树 + 花草 + 石头

### 色彩氛围
- **主色调**: 温暖橙红（落日）
- **辅助色**: 紫蓝（薄雾）+ 绿色（植物）
- **强调色**: 银白（瀑布）+ 黑色（乌鸦剪影）

## 🔧 生成建议

### 尺寸推荐
- **宽度**: 2048px 或 4096px（确保循环效果）
- **高度**: 1024px 或 2048px
- **比例**: 2:1 或 4:1（便于循环）

### 后期处理
1. 确保左右边缘颜色和元素能够自然衔接
2. 可以生成两张图后手动调整边缘
3. 测试循环效果：将图片并排放置检查连接处

## 💡 使用提示

1. **先生成基础版本**，检查整体效果
2. **如果边缘不匹配**，可以要求"加强左右边缘的连续性"
3. **可以分层生成**：
   - 远山层（静态）
   - 中景雾气层（可轻微动画）
   - 近景植物层（可微风摆动）

## 🎨 分层生成详细指南

### 第一层：远景背景层

```
远山背景层，卡通风格，傍晚时分，温暖的橙红色落日，连绵起伏的远山剪影，山峰上有银色瀑布飞流直下，天空渐变色从橙红到深紫，简洁的山峦轮廓，无缝水平循环设计，左右边缘完美衔接，平坦的地平线，适合横版游戏背景的最远层，2048x1024分辨率，动漫插画风格
```

### 第二层：中景雾气层

```
中景雾气层，半透明薄雾，漂浮在山谷间，几只黑色乌鸦剪影在空中飞舞，雾气呈现柔和的紫蓝色调，透明度70%，梦幻朦胧效果，水平无缝循环，雾气自然飘散形态，适合叠加在远山背景上，PNG格式带透明通道，卡通风格，2048x1024分辨率
```

### 第三层：近景植物层

```
近景植物前景层，盘根错节的古老大树，扭曲向上的树枝，树下五彩斑斓的野花，青翠草地，散落的光滑石头，丰富的细节，暖色调植物，部分透明区域便于角色穿行，水平无缝循环拼接，左右边缘植物自然衔接，适合横版游戏前景层，PNG透明背景，卡通风格，2048x1024分辨率
```

### 🔧 分层生成优势

1. **更好的控制**: 每层可以单独调整和优化
2. **循环更精确**: 每层分别确保无缝循环
3. **动态效果**: 不同层可以不同速度移动（视差滚动）
4. **易于修改**: 某层不满意可以单独重新生成

### 🎮 在Cocos Creator中的应用

#### 创建多层背景结构：
```
Scene
├── BackgroundLayers
│   ├── Layer1_Mountains (Z: -300)
│   ├── Layer2_Fog (Z: -200) 
│   └── Layer3_Plants (Z: -100)
├── Player (Z: 0)
└── Main Camera
```

#### 每层设置：
- **Layer1**: 移动速度 0.2x（最慢）
- **Layer2**: 移动速度 0.5x（中等）
- **Layer3**: 移动速度 0.8x（最快）

这样就能实现专业的视差滚动效果！

## 🎮 在游戏中的应用

生成后可以：
1. 设置为地图背景的Sprite
2. 通过脚本实现背景滚动循环
3. 分层使用实现视差滚动效果

这样生成的背景图就能完美适配您的横版游戏，营造出永远走不完的新手村氛围！

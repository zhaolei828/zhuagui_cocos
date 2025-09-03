# σ₂: System Patterns
*v1.0 | Created: 2025-01-03 | Updated: 2025-01-03*
*Π: INITIALIZING | Ω: START*

## 🏛️ Architecture Overview
基于Cocos Creator的组件化架构，采用分层设计模式组织游戏系统。

## 🔧 Core Components

### Player System
- **PlayerController**: 基础移动控制
- **PlayerControllerV2**: 带边界限制的增强版本
- 支持键盘输入（方向键/WASD）
- 平滑移动算法

### Camera System  
- **SimpleCameraFollow**: 基础摄像机跟随
- **SimpleFollow**: 简化版跟随组件
- 平滑跟随算法，可配置跟随速度

### Background System
- **ParallaxBackground**: 多层视差滚动控制器
- 支持无限循环背景
- 不同层级移动速度可配置

### Utility System
- **MathUtils**: 数学工具函数库
- **GameManager**: 游戏状态管理器（单例模式）

## 🎯 Design Patterns

### Component Pattern
每个功能模块设计为独立组件，可复用和组合。

### Observer Pattern  
游戏管理器作为中心调度，各组件监听状态变化。

### Singleton Pattern
GameManager采用单例模式，全局状态管理。

## 📁 File Organization
```
assets/scripts/
├── components/     # 可复用组件
├── managers/       # 管理器类
└── utils/         # 工具函数
```

## 🔄 Data Flow
Input → PlayerController → Node Position → CameraFollow → Camera Position
Background → ParallaxBackground → Layer Positions

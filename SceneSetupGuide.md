# 🎮 Main.scene 手动配置指南

## ✅ 场景已重置

Main.scene 现在是一个干净的基础场景，包含：
- **Main Camera** - 摄像机节点
- **Canvas** - UI画布节点

所有可能引发错误的组件引用都已移除，您可以安全地在Cocos Creator中打开并手动配置。

## 🛠️ 推荐的手动配置步骤

### 第一步：创建玩家角色
1. 在Canvas下创建一个空节点，命名为 `Player`
2. 添加组件：
   - UITransform（设置大小为50x50）
   - Sprite（设置颜色为红色）
   - PlayerController（设置速度为200）

### 第二步：创建背景
1. 在Canvas下创建空节点，命名为 `Background`
2. 添加子节点用于不同的背景层：
   - `Sky` - 天空层
   - `Mountains` - 山峰层
   - `Plants` - 植物层

### 第三步：设置摄像机跟随
1. 选中Main Camera节点
2. 添加 `SimpleCameraFollow` 组件
3. 将Player节点拖拽到Target字段
4. 设置跟随参数

### 第四步：测试运行
1. 保存场景
2. 点击预览按钮
3. 测试玩家移动和摄像机跟随

## 📋 可用的组件

项目中已准备好的组件：
- **PlayerController** - 基础玩家控制
- **PlayerControllerV2** - 带边界限制的玩家控制
- **SimpleCameraFollow** - 简单摄像机跟随
- **SimpleFollow** - 更简化的跟随
- **ParallaxBackground** - 视差滚动背景

## 🎯 现在您可以：

1. **在Cocos Creator中打开Main.scene**
2. **按照自己的想法创建节点结构**
3. **手动添加组件并配置参数**
4. **实时预览和调试效果**

这样的手动配置方式更加可控，不会出现脚本引用错误！

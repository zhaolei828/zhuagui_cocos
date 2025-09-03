# 抓鬼 - Cocos Creator 游戏项目

这是一个使用 Cocos Creator 3.8.7 开发的游戏项目。

## 项目结构

```
zhuagui/
├── assets/                 # 游戏资源目录
│   ├── scenes/            # 场景文件
│   ├── scripts/           # 脚本代码
│   │   ├── components/    # 组件脚本
│   │   ├── managers/      # 管理器脚本
│   │   └── utils/         # 工具脚本
│   ├── textures/          # 纹理贴图
│   ├── materials/         # 材质文件
│   ├── animations/        # 动画文件
│   ├── prefabs/           # 预制体
│   ├── audio/             # 音频文件
│   ├── fonts/             # 字体文件
│   └── resources/         # 动态加载资源
├── build/                 # 构建输出目录
├── library/               # 资源库（自动生成）
├── local/                 # 本地配置
├── profiles/              # 编辑器配置（自动生成）
├── settings/              # 项目设置（自动生成）
├── temp/                  # 临时文件（自动生成）
└── extensions/            # 扩展插件
```

## 开发环境

- **Cocos Creator**: 3.8.7
- **TypeScript**: 支持
- **平台支持**: Web, 移动端, 桌面端

## 快速开始

1. 使用 Cocos Creator 打开项目
2. 在编辑器中打开 `assets/scenes/Main.scene` 场景
3. 点击预览按钮运行游戏

## 脚本说明

### 组件脚本 (assets/scripts/components/)
- `PlayerController.ts`: 玩家控制器，处理玩家输入和移动

### 管理器脚本 (assets/scripts/managers/)
- `GameManager.ts`: 游戏管理器，管理游戏状态和流程

### 工具脚本 (assets/scripts/utils/)
- `MathUtils.ts`: 数学工具类，提供常用数学计算功能

## 游戏特性

- 基础的玩家控制系统
- 游戏状态管理
- 模块化的代码结构
- TypeScript 支持

## 构建发布

1. 在 Cocos Creator 中选择 "项目" -> "构建发布"
2. 选择目标平台
3. 配置构建参数
4. 点击构建按钮

## 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues](https://github.com/yourusername/zhuagui/issues)
- 邮箱: your.email@example.com

## 更新日志

### v1.0.0 (2025-03-09)
- 初始项目结构
- 基础玩家控制系统
- 游戏管理器框架
- 工具类库

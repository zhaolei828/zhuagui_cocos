import { _decorator, Component, Node, Input, input, EventKeyboard, KeyCode, Vec3, Sprite, UITransform, Color, SpriteFrame, Texture2D } from 'cc';
import { MapGenerator } from './MapGenerator';
import { TileMapRenderer } from './TileMapRenderer';
import { TextureGenerator } from '../utils/TextureGenerator';
import { ArtResourceManager } from '../utils/ArtResourceManager';
import { HealthComponent } from '../components/HealthComponent';
import { CombatComponent } from '../components/CombatComponent';
import { InventoryManager } from './InventoryManager';
import { TreasureChest } from '../components/TreasureChest';
import { AudioManager } from './AudioManager';
import { AnimationComponent } from '../components/AnimationComponent';
import { SaveManager } from './SaveManager';
import { DirectionalAttack } from '../components/DirectionalAttack';
import { AutoAttackComponent } from '../components/AutoAttackComponent';
import { LevelManager } from './LevelManager';
import { EquipmentManager } from '../components/EquipmentManager';
import { ArtResourcePreloader } from '../utils/ArtResourcePreloader';

const { ccclass, property } = _decorator;

/**
 * 游戏管理器 - 整合地图生成、玩家控制等核心系统
 * 支持随机地图生成和重新生成功能
 */

@ccclass('GameManager')
export class GameManager extends Component {
    
    @property({ type: MapGenerator, tooltip: "地图生成器" })
    mapGenerator: MapGenerator = null!;
    
    @property({ type: TileMapRenderer, tooltip: "地图渲染器" })
    mapRenderer: TileMapRenderer = null!;
    
    @property({ type: Node, tooltip: "玩家节点" })
    player: Node = null!;
    
    @property({ type: Node, tooltip: "摄像机节点" })
    cameraNode: Node = null!;
    
    @property({ tooltip: "玩家移动速度" })
    playerSpeed: number = 200;
    
    // 🔮 未来功能模块 - 待实现
    @property({ type: InventoryManager, tooltip: "背包管理器 (未实现)" })
    inventoryManager: InventoryManager = null!;
    
    @property({ type: AudioManager, tooltip: "音频管理器 (未实现)" })
    audioManager: AudioManager = null!;
    
    @property({ type: SaveManager, tooltip: "存档管理器 (未实现)" })
    saveManager: SaveManager = null!;
    
    @property({ type: EquipmentManager, tooltip: "装备管理器" })
    equipmentManager: EquipmentManager = null!;
    
    @property({ type: LevelManager, tooltip: "关卡管理器 (未实现)" })
    levelManager: LevelManager = null!;
    
    @property({ type: ArtResourcePreloader, tooltip: "美术资源预加载器" })
    artResourcePreloader: ArtResourcePreloader = null!
    
    // 控制状态
    private inputStates = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    
    // 游戏状态
    private isGameActive: boolean = false;
    
    // 玩家移动方向（用于攻击方向）
    private lastMoveDirection: Vec3 = new Vec3(1, 0, 0);

    async start() {
        console.log('🚀 GameManager 启动 - 代码已重新编译！'); // 🔥 编译验证标记
        
        // 🎨 初始化美术资源管理器
        console.log('🎨 初始化美术资源管理器...');
        await ArtResourceManager.initialize();
        console.log('✅ 美术资源管理器初始化完成');
        
        this.initializeGame();
        this.setupInput();
        // Player设置已在generateNewMap中完成，无需重复
    }
    
    /**
     * 初始化游戏
     */
    private initializeGame(): void {
        // 生成第一张地图
        this.generateNewMap();
        
        this.isGameActive = true;
    }
    
    /**
     * 设置输入监听
     */
    private setupInput(): void {
        // 尝试双重绑定：Cocos + DOM
        // Cocos输入系统
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        
        // DOM输入系统（备用）
        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', (e) => {
                this.handleDOMKeyDown(e);
            });
            document.addEventListener('keyup', (e) => {
                this.handleDOMKeyUp(e);
            });
        }
        
    }
    
    /**
     * DOM按键按下处理
     */
    private handleDOMKeyDown(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.inputStates.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.inputStates.right = true;
                break;
            case 'KeyW':
            case 'ArrowUp':
                this.inputStates.up = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.inputStates.down = true;
                break;
            case 'KeyR':
                console.log('🎮 DOM-R键被按下，重新生成地图');
                this.generateNewMap();
                break;
        }
    }
    
    /**
     * DOM按键释放处理
     */
    private handleDOMKeyUp(event: KeyboardEvent): void {
        switch (event.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.inputStates.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.inputStates.right = false;
                break;
            case 'KeyW':
            case 'ArrowUp':
                this.inputStates.up = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.inputStates.down = false;
                break;
        }
    }
    
    /**
     * 按键按下事件
     */
    private onKeyDown(event: EventKeyboard): void {
        console.log(`⌨️ 按键按下: ${event.keyCode}, 游戏激活: ${this.isGameActive}`);
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.inputStates.left = true;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.inputStates.right = true;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.inputStates.up = true;
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.inputStates.down = true;
                break;
            case KeyCode.KEY_R:
                // R键重新生成地图
                console.log('🎮 R键被按下，重新生成地图');
                this.generateNewMap();
                break;
            case KeyCode.SPACE:
                // 空格键攻击或交互
                console.log('🎮 空格键被按下');
                this.playerAttackOrInteract();
                break;
            case KeyCode.KEY_P:
                // P键暂停/恢复
                this.togglePause();
                break;
            case KeyCode.KEY_E:
                // E键测试装备武器
                this.testEquipWeapon();
                break;
            case KeyCode.KEY_Q:
                // Q键测试装备护甲
                this.testEquipArmor();
                break;
            case KeyCode.KEY_I:
                // I键打开背包
                this.toggleInventory();
                break;
            case KeyCode.KEY_1:
            case KeyCode.KEY_2:
            case KeyCode.KEY_3:
            case KeyCode.KEY_4:
            case KeyCode.KEY_5:
                // 数字键使用道具
                this.useInventoryItem(event.keyCode - KeyCode.KEY_1);
                break;
            case KeyCode.KEY_M:
                // M键切换音效
                if (this.audioManager) {
                    this.audioManager.toggleAudio();
                }
                break;
            case KeyCode.KEY_F5:
                // F5键快速存档
                this.quickSave();
                break;
            case KeyCode.KEY_F9:
                // F9键快速读档
                this.quickLoad();
                break;
            case KeyCode.KEY_N:
                // N键下一关
                this.nextLevel();
                break;
    }
}

/**
     * 按键释放事件
     */
    private onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.inputStates.left = false;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.inputStates.right = false;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.inputStates.up = false;
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.inputStates.down = false;
                break;
        }
    }
    
    update(deltaTime: number) {
        if (!this.isGameActive) return;
        
        this.updatePlayerMovement(deltaTime);
        this.updateCamera();
    }
    
    /**
     * 更新玩家移动
     */
    private updatePlayerMovement(deltaTime: number): void {
        if (!this.player || !this.mapRenderer) return;
        
        let moveX = 0;
        let moveY = 0;
        
        // 计算移动方向
        if (this.inputStates.left) moveX -= 1;
        if (this.inputStates.right) moveX += 1;
        if (this.inputStates.up) moveY += 1;
        if (this.inputStates.down) moveY -= 1;
        
        // 移动输入检测（简化日志）
        
        // 归一化对角线移动
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // √2/2
            moveY *= 0.707;
        }
        
        // 计算新位置
        const currentPos = this.player.getPosition();
        const newX = currentPos.x + moveX * this.playerSpeed * deltaTime;
        const newY = currentPos.y + moveY * this.playerSpeed * deltaTime;
        
        // 播放移动动画
        const animComponent = this.player.getComponent(AnimationComponent);
        if (animComponent && (moveX !== 0 || moveY !== 0)) {
            if (animComponent.getCurrentAnimation() !== 'move' as any) {
                animComponent.playAnimation('move' as any, true);
            }
        } else if (animComponent && moveX === 0 && moveY === 0) {
            if (animComponent.getCurrentAnimation() === 'move' as any) {
                animComponent.playAnimation('idle' as any, true);
            }
        }
        
        // 简化碰撞检测 - 暂时允许所有移动
        if (moveX !== 0 || moveY !== 0) {
            this.player.setPosition(newX, newY, currentPos.z);
            
            // 更新攻击方向
            this.lastMoveDirection.set(moveX, moveY, 0).normalize();
            const directionalAttack = this.player.getComponent(DirectionalAttack);
            if (directionalAttack) {
                directionalAttack.updateAttackDirection(this.lastMoveDirection);
            }
        }
        
        // 原碰撞检测代码（暂时注释）
        /*
        const gridPos = this.mapRenderer.worldToGrid(new Vec3(newX, newY, 0));
        
        if (this.mapRenderer.isWalkable(gridPos.x, gridPos.y)) {
            this.player.setPosition(newX, newY, currentPos.z);
        } else {
            // 尝试单轴移动
            const testX = this.mapRenderer.worldToGrid(new Vec3(newX, currentPos.y, 0));
            const testY = this.mapRenderer.worldToGrid(new Vec3(currentPos.x, newY, 0));
            
            if (this.mapRenderer.isWalkable(testX.x, testX.y)) {
                this.player.setPosition(newX, currentPos.y, currentPos.z);
            } else if (this.mapRenderer.isWalkable(testY.x, testY.y)) {
                this.player.setPosition(currentPos.x, newY, currentPos.z);
            }
        }
        */
    }

    /**
     * 更新摄像机跟随
     */
    private updateCamera(): void {
        if (!this.cameraNode || !this.player) return;
        
        const playerPos = this.player.getPosition();
        
        // 平滑跟随
        const currentCameraPos = this.cameraNode.getPosition();
        const lerpFactor = 0.05; // 跟随平滑度
        
        const newCameraX = currentCameraPos.x + (playerPos.x - currentCameraPos.x) * lerpFactor;
        const newCameraY = currentCameraPos.y + (playerPos.y - currentCameraPos.y) * lerpFactor;
        
        this.cameraNode.setPosition(newCameraX, newCameraY, currentCameraPos.z);
    }
    
    /**
     * 生成新地图
     */
    public generateNewMap(seed?: number): void {
        
        if (!this.mapGenerator || !this.mapRenderer) {
            console.error('❌ 地图生成器或渲染器未设置');
            return;
        }
        
        // 播放背景音乐
        if (this.audioManager) {
            this.audioManager.playBGM('game_bgm');
        }
        
        // 初始化关卡系统
        if (this.levelManager) {
            this.levelManager.mapGenerator = this.mapGenerator;
            this.setupLevelCallbacks();
            
            // 尝试读取存档或开始第一关
            this.initializeGameProgress();
        }
        
        // 生成地图数据
        this.mapGenerator.generateNewMap(seed);
        
        // 渲染地图
        this.mapRenderer.renderMap();
        
        // 将玩家移动到出生点
        if (this.player) {
            // 🔧 确保玩家可见性和状态
            this.player.active = true;
            
            // 确保Player有必要的组件（只设置一次）
            this.forceSetupPlayer();
            
            const spawnPos = this.mapGenerator.getSpawnPosition();
            this.player.setPosition(spawnPos.x, spawnPos.y, 10); // Z=10确保在地图之上
            console.log(`🏃 玩家移动到出生点: (${spawnPos.x}, ${spawnPos.y})`);
            
            // 🔧 确保Sprite可见
            const sprite = this.player.getComponent(Sprite);
            if (sprite) {
                sprite.enabled = true;
                sprite.color = new Color(255, 255, 255, 255);
            }
            
            // 摄像机立即跟上
            if (this.cameraNode) {
                this.cameraNode.setPosition(spawnPos.x, spawnPos.y, this.cameraNode.getPosition().z);
            }
        }
        
    }
    
    /**
     * 设置玩家组件
     */
    private setupPlayer(): void {
        if (!this.player) return;
        
        // 确保有UITransform组件
        let transform = this.player.getComponent(UITransform);
        if (!transform) {
            transform = this.player.addComponent(UITransform);
        }
        transform.setContentSize(40, 40);
        
        // 确保有Sprite组件并设置正确的SpriteFrame
        let sprite = this.player.getComponent(Sprite);
        if (!sprite) {
            sprite = this.player.addComponent(Sprite);
        }
        
        // 创建玩家Sprite（异步）
        this.createPlayerSpriteFrame(sprite);
        
        // 确保在正确的层级
        this.player.layer = 1073741824; // DEFAULT层
        
        // 🔧 添加战斗组件
        this.setupPlayerCombatComponents();
        
        // 🎯 添加方向性攻击组件
        this.setupPlayerDirectionalAttack();
        
    }
    
    /**
     * 为Player创建SpriteFrame - 优先使用美术资源，fallback到程序化图标
     */
    private async createPlayerSpriteFrame(sprite: Sprite): Promise<void> {
        try {
            // 🎨 尝试使用美术资源
            console.log('🎨 尝试加载玩家美术资源...');
            const spriteFrame = await ArtResourceManager.getSpriteFrame('player');
            sprite.spriteFrame = spriteFrame;
            console.log('✅ 使用玩家美术资源');
        } catch (error) {
            // 🔧 fallback到程序化图标
            console.log('⚠️ 美术资源加载失败，使用程序化图标:', error);
            const spriteFrame = TextureGenerator.createPlayerTexture(40);
            sprite.spriteFrame = spriteFrame;
            console.log('✅ 使用程序化玩家图标');
        }
    }
    
    /**
     * 玩家攻击或交互
     */
    private playerAttackOrInteract(): void {
        if (!this.player) {
            console.error('❌ 玩家节点不存在');
            return;
        }
        
        console.log('🎯 开始处理玩家攻击或交互');

        // 首先尝试交互（优先级更高）
        if (this.tryInteract()) {
            console.log('💰 执行交互，跳过攻击');
            return;
        }
        
        // 检查自动攻击组件
        const autoAttackComponent = this.player.getComponent(AutoAttackComponent);
        if (autoAttackComponent) {
            // 如果自动攻击组件存在，空格键切换自动攻击开关
            const currentState = autoAttackComponent.enableAutoAttack;
            autoAttackComponent.setAutoAttack(!currentState);
            console.log(`⚔️ 自动攻击${!currentState ? '开启' : '关闭'}`);
            return;
        }
        
        // 如果没有自动攻击组件，使用原有的手动攻击逻辑
        const directionalAttack = this.player.getComponent(DirectionalAttack);
        if (directionalAttack) {
            console.log('🎯 触发方向性攻击');
            directionalAttack.triggerAttack();
        } else {
            // 回退到基础攻击
            const combatComponent = this.player.getComponent(CombatComponent);
            if (combatComponent) {
                combatComponent.attack();
            } else {
                console.error('❌ 玩家缺少攻击组件');
                this.setupPlayerCombatComponents();
                this.setupPlayerDirectionalAttack();
            }
        }
    }
    
    /**
     * 尝试交互
     */
    private tryInteract(): boolean {
        if (!this.player) return false;
        
        // 寻找附近的宝箱
        const nearbyChest = this.findNearbyTreasureChest();
        if (nearbyChest) {
            const chestComponent = nearbyChest.getComponent(TreasureChest);
            if (chestComponent) {
                return chestComponent.tryOpen(this.player);
            }
        }
        
        return false;
    }
    
    /**
     * 寻找附近的宝箱
     */
    private findNearbyTreasureChest(): Node | null {
        if (!this.mapRenderer || !this.player) return null;
        
        const playerPos = this.player.getPosition();
        const interactionRange = 100;
        
        // 遍历地图容器中的所有子节点
        const mapContainer = this.mapRenderer.tileContainer;
        if (!mapContainer) return null;
        
        for (const child of mapContainer.children) {
            if (child.name.includes('treasure')) {
                const distance = child.getPosition().subtract(playerPos).length();
                if (distance <= interactionRange) {
                    return child;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 切换背包界面
     */
    private toggleInventory(): void {
        if (!this.inventoryManager) return;
        
        // 这里可以显示/隐藏背包UI
        console.log('🎒 切换背包界面');
        
        // 显示当前背包内容
        const items = this.inventoryManager.getAllItems();
        console.log('背包内容:');
        items.forEach((slot, index) => {
            if (slot.item) {
                console.log(`  ${index + 1}. ${slot.item.itemData.name} x${slot.quantity}`);
            }
        });
    }
    
    /**
     * 使用背包中的道具
     */
    private useInventoryItem(slotIndex: number): void {
        if (!this.inventoryManager) return;
        
        const success = this.inventoryManager.useItem(slotIndex, this.player);
        if (success) {
            console.log(`🎒 使用了槽位 ${slotIndex + 1} 的道具`);
        } else {
            console.log(`❌ 槽位 ${slotIndex + 1} 没有可用道具`);
        }
    }
    
    /**
     * 强制设置Player显示（只设置一次）
     */
    private forceSetupPlayer(): void {
        if (!this.player) {
            console.log('❌ Player节点未找到');
            return;
        }
        
        // 检查是否已经设置过
        const sprite = this.player.getComponent(Sprite);
        if (sprite && sprite.spriteFrame) {
            console.log('🎮 Player已经设置过，确保组件完整');
            // 即使Player已经设置，也要确保有新的攻击组件
            this.ensurePlayerComponents();
            return;
        }
        
        // 确保Player有正确的组件和显示
        this.setupPlayer();
        
        // 确保Player有战斗组件
        this.setupPlayerCombatComponents();
        
        // 确保Player有动画组件
        this.setupPlayerAnimation();
        
        console.log('✅ Player设置完成！');
    }
    
    /**
     * 确保玩家有所有必要组件
     */
    private ensurePlayerComponents(): void {
        if (!this.player) return;
        
        // 确保战斗组件
        this.setupPlayerCombatComponents();
        
        // 确保方向性攻击组件
        this.setupPlayerDirectionalAttack();
        
        // 确保动画组件
        this.setupPlayerAnimation();
    }
    
    /**
     * 设置玩家方向性攻击
     */
    private setupPlayerDirectionalAttack(): void {
        if (!this.player) return;
        
        // 添加方向性攻击组件
        let directionalAttack = this.player.getComponent(DirectionalAttack);
        if (!directionalAttack) {
            directionalAttack = this.player.addComponent(DirectionalAttack);
            directionalAttack.indicatorSize = 80;
            directionalAttack.attackAngle = 120; // 🔧 增加攻击角度
            directionalAttack.showAttackRange = true;
            console.log('✅ 为Player添加DirectionalAttack组件（120度范围）');
        }
    }
    
    /**
     * 设置玩家战斗组件
     */
    private setupPlayerCombatComponents(): void {
        if (!this.player) return;
        
        // 添加血量组件
        let healthComponent = this.player.getComponent(HealthComponent);
        if (!healthComponent) {
            healthComponent = this.player.addComponent(HealthComponent);
            healthComponent.maxHealth = 100;
            healthComponent.onHealthChanged = (current, max) => {
                console.log(`❤️ 玩家血量: ${current}/${max}`);
            };
            healthComponent.onDeath = () => {
                console.log('💀 玩家死亡');
                this.handlePlayerDeath();
            };
            console.log('✅ 为Player添加HealthComponent组件');
        }
        
        // 添加战斗组件
        let combatComponent = this.player.getComponent(CombatComponent);
        if (!combatComponent) {
            combatComponent = this.player.addComponent(CombatComponent);
            combatComponent.attackDamage = 25;
            combatComponent.attackRange = 150; // 🔧 增加攻击范围
            combatComponent.attackCooldown = 0.5;
            combatComponent.targetTags = ['Enemy']; // 🔧 修正目标标签
            combatComponent.autoAttack = false; // 🔧 关闭原有自动攻击，使用新的AutoAttack组件
            console.log('✅ 为Player添加CombatComponent组件（范围150）');
        }
        
        // 添加智能自动攻击组件
        let autoAttackComponent = this.player.getComponent(AutoAttackComponent);
        if (!autoAttackComponent) {
            autoAttackComponent = this.player.addComponent(AutoAttackComponent);
            autoAttackComponent.attackRange = 150;
            autoAttackComponent.attackInterval = 0.8;
            autoAttackComponent.enableAutoAttack = true;
            console.log('✅ 为Player添加AutoAttackComponent组件（智能自动攻击）');
        }
    }
    
    /**
     * 处理玩家死亡
     */
    private handlePlayerDeath(): void {
        console.log('💀 游戏结束');
        this.isGameActive = false;
        
        // 可以在这里添加游戏结束界面
        this.scheduleOnce(() => {
            console.log('🔄 重新开始游戏');
            this.restartGame();
        }, 3.0);
    }
    
    /**
     * 重新开始游戏
     */
    private restartGame(): void {
        // 🔧 确保玩家节点存在并且可见
        if (this.player) {
            this.player.active = true; // 确保玩家节点激活
            
            // 重置玩家血量
            const healthComponent = this.player.getComponent(HealthComponent);
            if (healthComponent) {
                healthComponent.resetHealth();
            }
            
            // 🔧 确保玩家有正确的Sprite显示
            const sprite = this.player.getComponent(Sprite);
            if (sprite) {
                sprite.enabled = true; // 确保Sprite组件启用
                sprite.color = new Color(255, 255, 255, 255); // 重置颜色和透明度
            }
            
            // 🔧 重要：重置玩家节点的变换，确保方向正确
            this.player.setRotationFromEuler(0, 0, 0); // 重置旋转
            this.player.setScale(1, 1, 1); // 重置缩放
            console.log(`🔧 玩家方向重置: rotation=${this.player.eulerAngles}, scale=${this.player.scale}`);
            
            console.log('🔄 玩家状态重置完成');
        }
        
        // 重新生成地图
        this.generateNewMap();
        
        // 重新激活游戏
        this.isGameActive = true;
        console.log('🎮 游戏重新开始');
    }
    
    /**
     * 快速存档
     */
    private quickSave(): void {
        if (!this.saveManager) return;
        
        console.log('💾 执行快速存档...');
        const success = this.saveManager.saveGame(this.player, this.inventoryManager, this.getGameProgress());
        
        if (success) {
            console.log('✅ 快速存档成功');
        } else {
            console.log('❌ 快速存档失败');
        }
    }
    
    /**
     * 快速读档
     */
    private quickLoad(): void {
        if (!this.saveManager) return;
        
        console.log('📂 执行快速读档...');
        const saveData = this.saveManager.loadGame();
        
        if (saveData) {
            this.applySaveData(saveData);
            console.log('✅ 快速读档成功');
        } else {
            console.log('❌ 快速读档失败或无存档');
        }
    }
    
    /**
     * 下一关
     */
    private nextLevel(): void {
        if (!this.levelManager) return;
        
        const currentLevel = this.levelManager.currentLevel;
        const nextLevel = currentLevel + 1;
        
        if (this.levelManager.isLevelUnlocked(nextLevel)) {
            this.levelManager.startLevel(nextLevel);
        } else {
            console.log(`🔒 关卡 ${nextLevel} 尚未解锁`);
        }
    }
    
    /**
     * 获取游戏进度数据
     */
    private getGameProgress(): any {
        return {
            currentLevel: this.levelManager?.currentLevel || 1,
            levelsCompleted: this.levelManager?.getUnlockedLevels().length - 1 || 0,
            totalPlayTime: 0, // 这将在SaveManager中计算
            enemiesDefeated: 0, // 可以从统计中获取
            treasuresFound: 0,
            deathCount: 0
        };
    }
    
    /**
     * 应用存档数据
     */
    private applySaveData(saveData: any): void {
        try {
            // 恢复玩家状态
            if (saveData.playerData && this.player) {
                const healthComponent = this.player.getComponent(HealthComponent);
                if (healthComponent) {
                    healthComponent.resetHealth();
                    // 可以设置具体的血量值
                }
                
                // 恢复玩家位置
                const pos = saveData.playerData.position;
                this.player.setPosition(pos.x, pos.y, pos.z);
            }
            
            // 恢复关卡进度
            if (saveData.gameProgress && this.levelManager) {
                this.levelManager.currentLevel = saveData.gameProgress.currentLevel;
                // 可以恢复更多关卡数据
            }
            
            // 恢复背包（这里需要InventoryManager的支持）
            if (saveData.inventoryData && this.inventoryManager) {
                // this.inventoryManager.loadFromSaveData(saveData.inventoryData);
            }
            
            // 恢复设置
            if (saveData.settings && this.audioManager) {
                this.audioManager.setBGMVolume(saveData.settings.bgmVolume);
                this.audioManager.setSFXVolume(saveData.settings.sfxVolume);
            }
            
        } catch (error) {
            console.error('❌ 应用存档数据失败:', error);
        }
    }
    
    /**
     * 初始化游戏进度
     */
    private initializeGameProgress(): void {
        if (!this.saveManager || !this.levelManager) return;
        
        if (this.saveManager.hasSaveData()) {
            console.log('📂 发现存档，是否自动读取?');
            // 这里可以显示UI让玩家选择，暂时直接读取
            this.quickLoad();
        } else {
            console.log('🎯 开始新游戏，第一关');
            this.levelManager.startLevel(1);
        }
    }
    
    /**
     * 设置关卡回调
     */
    private setupLevelCallbacks(): void {
        if (!this.levelManager) return;
        
        this.levelManager.onLevelStart = (level: number) => {
            console.log(`🎯 关卡 ${level} 开始`);
            this.generateNewMap(); // 为新关卡生成地图
        };
        
        this.levelManager.onLevelComplete = (level: number, stats: any) => {
            console.log(`🎉 恭喜通过关卡 ${level}！`);
            this.quickSave(); // 自动存档
        };
        
        this.levelManager.onLevelFailed = (level: number) => {
            console.log(`💀 关卡 ${level} 失败`);
            // 可以显示失败界面
        };
        
        this.levelManager.onNewLevelUnlocked = (level: number) => {
            console.log(`🔓 新关卡解锁: ${level}`);
            // 可以播放解锁动画
        };
    }
    
    /**
     * 设置玩家动画组件
     */
    private setupPlayerAnimation(): void {
        if (!this.player) return;
        
        let animComponent = this.player.getComponent(AnimationComponent);
        if (!animComponent) {
            animComponent = this.player.addComponent(AnimationComponent);
            animComponent.enableAnimation = true;
            animComponent.animationSpeed = 1.2;
            console.log('✅ 为Player添加AnimationComponent组件');
        }
    }
    
    /**
     * 暂停/恢复游戏
     */
    private togglePause(): void {
        this.isGameActive = !this.isGameActive;
        console.log(this.isGameActive ? '▶️ 游戏恢复' : '⏸️ 游戏暂停');
    }
    
    /**
     * 获取当前房间信息
     */
    public getCurrentRoom(): any {
        if (!this.player || !this.mapRenderer || !this.mapGenerator) return null;
        
        const playerPos = this.player.getPosition();
        const gridPos = this.mapRenderer.worldToGrid(playerPos);
        const rooms = this.mapGenerator.getRooms();
        
        // 查找玩家所在的房间
        for (const room of rooms) {
            if (gridPos.x >= room.x && gridPos.x < room.x + room.width &&
                gridPos.y >= room.y && gridPos.y < room.y + room.height) {
                return room;
            }
        }
        
        return null;
    }
    
    /**
     * 获取游戏统计信息
     */
    public getGameStats(): any {
        const rooms = this.mapGenerator ? this.mapGenerator.getRooms() : [];
        const currentRoom = this.getCurrentRoom();
        
        return {
            totalRooms: rooms.length,
            currentRoomType: currentRoom ? currentRoom.type : 'corridor',
            playerPosition: this.player ? this.player.getPosition() : new Vec3(0, 0, 0),
            isGameActive: this.isGameActive
        };
    }
    
    /**
     * 测试装备武器 (E键)
     */
    private testEquipWeapon(): void {
        if (!this.equipmentManager) {
            console.warn('⚠️ 装备管理器未配置');
            return;
        }
        
        console.log('⚔️ 测试装备武器...');
        const testWeapon = EquipmentManager.createTestWeapon();
        const success = this.equipmentManager.equipWeapon(testWeapon);
        
        if (success) {
            console.log('✅ 武器装备成功！查看攻击力加成。');
            // 显示当前装备信息
            const info = this.equipmentManager.getEquipmentInfo();
            console.log(`📊 当前装备: 武器加成+${info.totalAttackBonus}, 防御加成+${info.totalDefenseBonus}`);
        }
    }
    
    /**
     * 测试装备护甲 (Q键)
     */
    private testEquipArmor(): void {
        if (!this.equipmentManager) {
            console.warn('⚠️ 装备管理器未配置');
            return;
        }
        
        console.log('🛡️ 测试装备护甲...');
        const testArmor = EquipmentManager.createTestArmor();
        const success = this.equipmentManager.equipArmor(testArmor);
        
        if (success) {
            console.log('✅ 护甲装备成功！查看防御力加成。');
            // 显示当前装备信息
            const info = this.equipmentManager.getEquipmentInfo();
            console.log(`📊 当前装备: 武器加成+${info.totalAttackBonus}, 防御加成+${info.totalDefenseBonus}`);
        }
    }


    onDestroy() {
        // 清理输入监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}
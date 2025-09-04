import { _decorator, Component, Node } from 'cc';
import { MapGenerator } from './MapGenerator';

const { ccclass, property } = _decorator;

/**
 * 关卡类型
 */
export enum LevelType {
    NORMAL = 'normal',
    BOSS = 'boss',
    TREASURE = 'treasure',
    SPECIAL = 'special'
}

/**
 * 关卡配置接口
 */
export interface LevelConfig {
    level: number;
    type: LevelType;
    name: string;
    description: string;
    difficulty: number;
    
    // 地图配置
    mapConfig: {
        width: number;
        height: number;
        roomCount: number;
        enemyCount: number;
        treasureCount: number;
    };
    
    // 敌人配置
    enemyConfig: {
        baseHealth: number;
        baseDamage: number;
        spawnRate: number;
        types: string[];
    };
    
    // 奖励配置
    rewards: {
        experience: number;
        goldMin: number;
        goldMax: number;
        specialItems: string[];
    };
    
    // 解锁条件
    unlockConditions: {
        minLevel: number;
        requiredLevels: number[];
        itemRequirements: string[];
    };
}

/**
 * 关卡管理器
 */
@ccclass('LevelManager')
export class LevelManager extends Component {
    
    @property({ tooltip: "当前关卡" })
    currentLevel: number = 1;
    
    @property({ tooltip: "最大关卡数" })
    maxLevel: number = 50;
    
    @property({ tooltip: "难度增长率" })
    difficultyScaling: number = 1.2;
    
    @property({ tooltip: "地图生成器引用" })
    mapGenerator: MapGenerator = null!;
    
    // 关卡配置数据
    private levelConfigs: Map<number, LevelConfig> = new Map();
    private unlockedLevels: Set<number> = new Set();
    
    // 当前关卡状态
    private currentLevelConfig: LevelConfig = null!;
    private levelStartTime: number = 0;
    private enemiesKilled: number = 0;
    private treasuresCollected: number = 0;
    
    // 事件回调
    public onLevelStart: (level: number) => void = null!;
    public onLevelComplete: (level: number, stats: any) => void = null!;
    public onLevelFailed: (level: number) => void = null!;
    public onNewLevelUnlocked: (level: number) => void = null!;
    
    // 单例
    private static instance: LevelManager;
    
    public static getInstance(): LevelManager {
        return LevelManager.instance;
    }
    
    start() {
        LevelManager.instance = this;
        this.initializeLevelConfigs();
        this.unlockInitialLevels();
        
        console.log(`🎯 关卡管理器初始化完成，当前关卡: ${this.currentLevel}`);
    }
    
    /**
     * 开始关卡
     */
    startLevel(level: number): boolean {
        if (!this.isLevelUnlocked(level)) {
            console.log(`🔒 关卡 ${level} 尚未解锁`);
            return false;
        }
        
        const config = this.getLevelConfig(level);
        if (!config) {
            console.error(`❌ 关卡 ${level} 配置不存在`);
            return false;
        }
        
        this.currentLevel = level;
        this.currentLevelConfig = config;
        this.levelStartTime = Date.now();
        this.enemiesKilled = 0;
        this.treasuresCollected = 0;
        
        // 应用关卡配置到地图生成器
        this.applyLevelConfig(config);
        
        console.log(`🎯 开始关卡 ${level}: ${config.name}`);
        console.log(`📝 ${config.description}`);
        
        this.onLevelStart && this.onLevelStart(level);
        return true;
    }
    
    /**
     * 完成关卡
     */
    completeLevel(): void {
        if (!this.currentLevelConfig) return;
        
        const completionTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
        const stats = {
            level: this.currentLevel,
            completionTime: completionTime,
            enemiesKilled: this.enemiesKilled,
            treasuresCollected: this.treasuresCollected,
            rewards: this.currentLevelConfig.rewards
        };
        
        console.log(`🎉 关卡 ${this.currentLevel} 完成！`);
        console.log(`⏱️ 完成时间: ${completionTime}秒`);
        console.log(`👹 击败敌人: ${this.enemiesKilled}`);
        console.log(`💰 收集宝藏: ${this.treasuresCollected}`);
        
        // 解锁下一关卡
        this.unlockNextLevel();
        
        this.onLevelComplete && this.onLevelComplete(this.currentLevel, stats);
    }
    
    /**
     * 关卡失败
     */
    failLevel(): void {
        if (!this.currentLevelConfig) return;
        
        console.log(`💀 关卡 ${this.currentLevel} 失败`);
        this.onLevelFailed && this.onLevelFailed(this.currentLevel);
    }
    
    /**
     * 记录敌人击败
     */
    recordEnemyKill(): void {
        this.enemiesKilled++;
        console.log(`👹 击败敌人 +1 (总计: ${this.enemiesKilled})`);
    }
    
    /**
     * 记录宝藏收集
     */
    recordTreasureCollected(): void {
        this.treasuresCollected++;
        console.log(`💰 收集宝藏 +1 (总计: ${this.treasuresCollected})`);
    }
    
    /**
     * 获取关卡配置
     */
    getLevelConfig(level: number): LevelConfig | null {
        return this.levelConfigs.get(level) || null;
    }
    
    /**
     * 检查关卡是否解锁
     */
    isLevelUnlocked(level: number): boolean {
        return this.unlockedLevels.has(level);
    }
    
    /**
     * 获取已解锁的关卡列表
     */
    getUnlockedLevels(): number[] {
        return Array.from(this.unlockedLevels).sort((a, b) => a - b);
    }
    
    /**
     * 获取当前关卡进度
     */
    getCurrentProgress(): { current: number, total: number, percentage: number } {
        const unlockedCount = this.unlockedLevels.size;
        return {
            current: unlockedCount,
            total: this.maxLevel,
            percentage: Math.floor((unlockedCount / this.maxLevel) * 100)
        };
    }
    
    /**
     * 解锁下一关卡
     */
    private unlockNextLevel(): void {
        const nextLevel = this.currentLevel + 1;
        if (nextLevel <= this.maxLevel && !this.unlockedLevels.has(nextLevel)) {
            this.unlockedLevels.add(nextLevel);
            console.log(`🔓 解锁新关卡: ${nextLevel}`);
            
            this.onNewLevelUnlocked && this.onNewLevelUnlocked(nextLevel);
        }
    }
    
    /**
     * 应用关卡配置
     */
    private applyLevelConfig(config: LevelConfig): void {
        if (!this.mapGenerator) return;
        
        // 设置地图参数
        this.mapGenerator.mapWidth = config.mapConfig.width;
        this.mapGenerator.mapHeight = config.mapConfig.height;
        this.mapGenerator.roomCount = config.mapConfig.roomCount;
        
        console.log(`🗺️ 应用关卡配置: ${config.mapConfig.width}x${config.mapConfig.height}, ${config.mapConfig.roomCount}个房间`);
    }
    
    /**
     * 解锁初始关卡
     */
    private unlockInitialLevels(): void {
        this.unlockedLevels.add(1); // 第一关总是解锁的
    }
    
    /**
     * 初始化关卡配置
     */
    private initializeLevelConfigs(): void {
        // 生成各关卡配置
        for (let level = 1; level <= this.maxLevel; level++) {
            const config = this.generateLevelConfig(level);
            this.levelConfigs.set(level, config);
        }
        
        console.log(`🎯 生成了 ${this.levelConfigs.size} 个关卡配置`);
    }
    
    /**
     * 生成关卡配置
     */
    private generateLevelConfig(level: number): LevelConfig {
        const difficulty = Math.pow(this.difficultyScaling, level - 1);
        const isBossLevel = level % 10 === 0;
        const isTreasureLevel = level % 5 === 0 && !isBossLevel;
        
        let type = LevelType.NORMAL;
        if (isBossLevel) type = LevelType.BOSS;
        else if (isTreasureLevel) type = LevelType.TREASURE;
        
        return {
            level: level,
            type: type,
            name: this.getLevelName(level, type),
            description: this.getLevelDescription(level, type),
            difficulty: difficulty,
            
            mapConfig: {
                width: Math.min(50 + Math.floor(level / 5) * 10, 120),
                height: Math.min(50 + Math.floor(level / 5) * 10, 120),
                roomCount: Math.min(8 + Math.floor(level / 3), 20),
                enemyCount: Math.floor(5 + level * 1.5),
                treasureCount: Math.floor(2 + level * 0.3)
            },
            
            enemyConfig: {
                baseHealth: Math.floor(50 * difficulty),
                baseDamage: Math.floor(15 * difficulty),
                spawnRate: Math.min(0.3 + level * 0.02, 0.8),
                types: this.getEnemyTypes(level)
            },
            
            rewards: {
                experience: Math.floor(100 * difficulty),
                goldMin: Math.floor(50 * difficulty),
                goldMax: Math.floor(150 * difficulty),
                specialItems: this.getSpecialItems(level, type)
            },
            
            unlockConditions: {
                minLevel: level - 1,
                requiredLevels: level > 1 ? [level - 1] : [],
                itemRequirements: []
            }
        };
    }
    
    /**
     * 获取关卡名称
     */
    private getLevelName(level: number, type: LevelType): string {
        switch (type) {
            case LevelType.BOSS:
                return `第${level}层 - Boss关卡`;
            case LevelType.TREASURE:
                return `第${level}层 - 宝藏关卡`;
            case LevelType.SPECIAL:
                return `第${level}层 - 特殊关卡`;
            default:
                return `第${level}层 - 普通关卡`;
        }
    }
    
    /**
     * 获取关卡描述
     */
    private getLevelDescription(level: number, type: LevelType): string {
        switch (type) {
            case LevelType.BOSS:
                return `强大的Boss守护着这一层，准备好迎接挑战！`;
            case LevelType.TREASURE:
                return `这一层隐藏着丰富的宝藏，仔细探索每个角落。`;
            case LevelType.SPECIAL:
                return `神秘的力量影响着这一层，小心意外的情况。`;
            default:
                return `探索这一层，击败所有敌人并收集宝藏。`;
        }
    }
    
    /**
     * 获取敌人类型
     */
    private getEnemyTypes(level: number): string[] {
        const types = ['goblin'];
        
        if (level >= 5) types.push('orc');
        if (level >= 10) types.push('skeleton');
        if (level >= 15) types.push('demon');
        if (level >= 20) types.push('dragon');
        
        return types;
    }
    
    /**
     * 获取特殊物品
     */
    private getSpecialItems(level: number, type: LevelType): string[] {
        const items: string[] = [];
        
        if (type === LevelType.BOSS) {
            items.push('boss_weapon', 'boss_armor');
        }
        
        if (type === LevelType.TREASURE) {
            items.push('rare_gem', 'magic_scroll');
        }
        
        if (level >= 10) {
            items.push('legendary_item');
        }
        
        return items;
    }
    
    /**
     * 静态方法：记录敌人击败
     */
    static recordEnemyKill(): void {
        const instance = LevelManager.getInstance();
        if (instance) {
            instance.recordEnemyKill();
        }
    }
    
    /**
     * 静态方法：记录宝藏收集
     */
    static recordTreasureCollected(): void {
        const instance = LevelManager.getInstance();
        if (instance) {
            instance.recordTreasureCollected();
        }
    }
}

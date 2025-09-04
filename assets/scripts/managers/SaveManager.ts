import { _decorator, Component, Node, sys } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 游戏存档数据接口
 */
export interface GameSaveData {
    version: string;
    timestamp: number;
    playerData: {
        health: number;
        maxHealth: number;
        position: { x: number, y: number, z: number };
        level: number;
        experience: number;
    };
    inventoryData: {
        items: Array<{
            id: string;
            quantity: number;
            slotIndex: number;
        }>;
        capacity: number;
    };
    gameProgress: {
        currentLevel: number;
        levelsCompleted: number;
        totalPlayTime: number;
        enemiesDefeated: number;
        treasuresFound: number;
        deathCount: number;
    };
    mapData?: {
        seed: number;
        currentMap: any;
    };
    settings: {
        audioEnabled: boolean;
        bgmVolume: number;
        sfxVolume: number;
        animationEnabled: boolean;
    };
}

/**
 * 存档管理器
 */
@ccclass('SaveManager')
export class SaveManager extends Component {
    
    @property({ tooltip: "存档版本号" })
    private readonly SAVE_VERSION = "1.0.0";
    
    @property({ tooltip: "存档文件键名" })
    private readonly SAVE_KEY = "zhuagui_game_save";
    
    @property({ tooltip: "自动存档间隔(秒)" })
    autoSaveInterval: number = 60;
    
    @property({ tooltip: "是否启用自动存档" })
    enableAutoSave: boolean = true;
    
    // 游戏数据引用
    private gameStartTime: number = 0;
    private lastSaveTime: number = 0;
    
    // 事件回调
    public onSaveCompleted: (success: boolean) => void = null!;
    public onLoadCompleted: (success: boolean, data?: GameSaveData) => void = null!;
    
    // 单例
    private static instance: SaveManager;
    
    public static getInstance(): SaveManager {
        return SaveManager.instance;
    }
    
    start() {
        SaveManager.instance = this;
        this.gameStartTime = Date.now();
        
        // 启动自动存档
        if (this.enableAutoSave) {
            this.schedule(this.autoSave, this.autoSaveInterval);
        }
        
        console.log('💾 存档管理器初始化完成');
    }
    
    /**
     * 保存游戏
     */
    saveGame(playerNode?: Node, inventoryManager?: any, gameProgress?: any): boolean {
        try {
            const saveData: GameSaveData = {
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                playerData: this.collectPlayerData(playerNode),
                inventoryData: this.collectInventoryData(inventoryManager),
                gameProgress: this.collectGameProgress(gameProgress),
                settings: this.collectSettings()
            };
            
            const saveString = JSON.stringify(saveData);
            
            // 使用Cocos Creator的本地存储
            sys.localStorage.setItem(this.SAVE_KEY, saveString);
            
            this.lastSaveTime = Date.now();
            console.log('💾 游戏存档成功');
            
            this.onSaveCompleted && this.onSaveCompleted(true);
            return true;
            
        } catch (error) {
            console.error('❌ 游戏存档失败:', error);
            this.onSaveCompleted && this.onSaveCompleted(false);
            return false;
        }
    }
    
    /**
     * 读取游戏
     */
    loadGame(): GameSaveData | null {
        try {
            const saveString = sys.localStorage.getItem(this.SAVE_KEY);
            
            if (!saveString) {
                console.log('📂 没有找到存档文件');
                this.onLoadCompleted && this.onLoadCompleted(false);
                return null;
            }
            
            const saveData: GameSaveData = JSON.parse(saveString);
            
            // 检查版本兼容性
            if (!this.isVersionCompatible(saveData.version)) {
                console.warn('⚠️ 存档版本不兼容:', saveData.version);
                this.onLoadCompleted && this.onLoadCompleted(false);
                return null;
            }
            
            console.log('📂 游戏读档成功');
            this.onLoadCompleted && this.onLoadCompleted(true, saveData);
            return saveData;
            
        } catch (error) {
            console.error('❌ 游戏读档失败:', error);
            this.onLoadCompleted && this.onLoadCompleted(false);
            return null;
        }
    }
    
    /**
     * 删除存档
     */
    deleteSave(): boolean {
        try {
            sys.localStorage.removeItem(this.SAVE_KEY);
            console.log('🗑️ 存档删除成功');
            return true;
        } catch (error) {
            console.error('❌ 存档删除失败:', error);
            return false;
        }
    }
    
    /**
     * 检查是否有存档
     */
    hasSaveData(): boolean {
        const saveString = sys.localStorage.getItem(this.SAVE_KEY);
        return !!saveString;
    }
    
    /**
     * 获取存档信息
     */
    getSaveInfo(): { timestamp: number, version: string, playTime: number } | null {
        try {
            const saveString = sys.localStorage.getItem(this.SAVE_KEY);
            if (!saveString) return null;
            
            const saveData: GameSaveData = JSON.parse(saveString);
            return {
                timestamp: saveData.timestamp,
                version: saveData.version,
                playTime: saveData.gameProgress.totalPlayTime
            };
        } catch (error) {
            console.error('❌ 获取存档信息失败:', error);
            return null;
        }
    }
    
    /**
     * 自动存档
     */
    private autoSave(): void {
        console.log('⏰ 执行自动存档');
        this.saveGame();
    }
    
    /**
     * 收集玩家数据
     */
    private collectPlayerData(playerNode?: Node): GameSaveData['playerData'] {
        const defaultData = {
            health: 100,
            maxHealth: 100,
            position: { x: 0, y: 0, z: 0 },
            level: 1,
            experience: 0
        };
        
        if (!playerNode) return defaultData;
        
        // 从HealthComponent获取血量信息
        const healthComponent = playerNode.getComponent('HealthComponent' as any);
        const position = playerNode.getPosition();
        
        return {
            health: healthComponent ? healthComponent.currentHealth : defaultData.health,
            maxHealth: healthComponent ? healthComponent.maxHealth : defaultData.maxHealth,
            position: { x: position.x, y: position.y, z: position.z },
            level: defaultData.level, // 后续可以扩展等级系统
            experience: defaultData.experience
        };
    }
    
    /**
     * 收集背包数据
     */
    private collectInventoryData(inventoryManager?: any): GameSaveData['inventoryData'] {
        const defaultData = {
            items: [],
            capacity: 20
        };
        
        if (!inventoryManager) return defaultData;
        
        try {
            const items = inventoryManager.getAllItems();
            const itemsData = items.map((slot: any, index: number) => {
                if (slot.item) {
                    return {
                        id: slot.item.itemData.id,
                        quantity: slot.quantity,
                        slotIndex: index
                    };
                }
                return null;
            }).filter((item: any) => item !== null);
            
            return {
                items: itemsData,
                capacity: inventoryManager.capacity || defaultData.capacity
            };
        } catch (error) {
            console.error('❌ 收集背包数据失败:', error);
            return defaultData;
        }
    }
    
    /**
     * 收集游戏进度数据
     */
    private collectGameProgress(gameProgress?: any): GameSaveData['gameProgress'] {
        const currentTime = Date.now();
        const sessionTime = Math.floor((currentTime - this.gameStartTime) / 1000);
        
        return {
            currentLevel: gameProgress?.currentLevel || 1,
            levelsCompleted: gameProgress?.levelsCompleted || 0,
            totalPlayTime: gameProgress?.totalPlayTime + sessionTime || sessionTime,
            enemiesDefeated: gameProgress?.enemiesDefeated || 0,
            treasuresFound: gameProgress?.treasuresFound || 0,
            deathCount: gameProgress?.deathCount || 0
        };
    }
    
    /**
     * 收集设置数据
     */
    private collectSettings(): GameSaveData['settings'] {
        // 可以从AudioManager等组件获取设置
        return {
            audioEnabled: true,
            bgmVolume: 0.5,
            sfxVolume: 0.7,
            animationEnabled: true
        };
    }
    
    /**
     * 检查版本兼容性
     */
    private isVersionCompatible(saveVersion: string): boolean {
        // 简单的版本检查，可以根据需要扩展
        const currentMajor = parseInt(this.SAVE_VERSION.split('.')[0]);
        const saveMajor = parseInt(saveVersion.split('.')[0]);
        
        return currentMajor === saveMajor;
    }
    
    /**
     * 导出存档（用于备份）
     */
    exportSave(): string | null {
        try {
            const saveString = sys.localStorage.getItem(this.SAVE_KEY);
            if (saveString) {
                console.log('📤 存档导出成功');
                return saveString;
            }
            return null;
        } catch (error) {
            console.error('❌ 存档导出失败:', error);
            return null;
        }
    }
    
    /**
     * 导入存档（用于恢复）
     */
    importSave(saveString: string): boolean {
        try {
            // 验证存档格式
            const saveData: GameSaveData = JSON.parse(saveString);
            if (!saveData.version || !saveData.timestamp) {
                console.error('❌ 无效的存档格式');
                return false;
            }
            
            sys.localStorage.setItem(this.SAVE_KEY, saveString);
            console.log('📥 存档导入成功');
            return true;
        } catch (error) {
            console.error('❌ 存档导入失败:', error);
            return false;
        }
    }
    
    /**
     * 静态方法：快速保存
     */
    static quickSave(): boolean {
        const instance = SaveManager.getInstance();
        if (instance) {
            return instance.saveGame();
        }
        return false;
    }
    
    /**
     * 静态方法：快速读取
     */
    static quickLoad(): GameSaveData | null {
        const instance = SaveManager.getInstance();
        if (instance) {
            return instance.loadGame();
        }
        return null;
    }
}

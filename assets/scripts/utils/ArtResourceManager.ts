import { _decorator, Component, SpriteFrame, resources, Texture2D, ImageAsset } from 'cc';
import { TextureGenerator } from './TextureGenerator';
import { ArtResourcePreloader } from './ArtResourcePreloader';

const { ccclass, property } = _decorator;

/**
 * 美术资源管理器 - 统一管理游戏美术资源
 * 支持美术资源和程序化图标的无缝切换
 */
@ccclass('ArtResourceManager')
export class ArtResourceManager {
    
    // 资源缓存
    private static spriteFrameCache: Map<string, SpriteFrame> = new Map();
    private static initialized: boolean = false;
    
    // 美术资源路径配置
    private static readonly ASSET_PATHS = {
        // 角色
        player: 'textures/characters/player',
        playerIdle: 'textures/characters/player_idle',
        playerWalk: 'textures/characters/player_walk',
        playerAttack: 'textures/characters/player_attack',
        
        // 敌人
        enemy: 'textures/enemies/enemy',
        enemyIdle: 'textures/enemies/enemy_idle',
        enemyWalk: 'textures/enemies/enemy_walk',
        enemyAttack: 'textures/enemies/enemy_attack',
        
        // 道具
        treasureChest: 'textures/items/treasureChest',
        treasureChestOpen: 'textures/items/treasure_chest_open',
        potion: 'textures/items/potion',
        weapon: 'textures/items/weapon',
        armor: 'textures/items/armor',
        
        // UI
        heart: 'textures/ui/heart',
        heartEmpty: 'textures/ui/heart_empty',
        inventorySlot: 'textures/ui/inventory_slot',
        button: 'textures/ui/button',
        
        // 特效
        explosion: 'textures/effects/explosion',
        heal: 'textures/effects/heal',
        damage: 'textures/effects/damage',
        
        // 地图瓦片
        floor: 'textures/tiles/floor',
        wall: 'textures/tiles/wall',
        corridor: 'textures/tiles/corridor',
        door: 'textures/tiles/door'
    };
    
    /**
     * 初始化美术资源管理器
     */
    static async initialize(): Promise<void> {
        if (this.initialized) return;
        
        console.log('🎨 初始化美术资源管理器...');
        
        // 清理缓存，确保使用最新配置
        this.spriteFrameCache.clear();
        console.log('🧹 清理美术资源缓存');
        
        // 预加载核心资源
        await this.preloadCoreAssets();
        
        this.initialized = true;
        console.log('✅ 美术资源管理器初始化完成');
    }
    
    /**
     * 预加载核心美术资源
     */
    private static async preloadCoreAssets(): Promise<void> {
        const coreAssets = [
            'player', 'enemy', 'treasureChest', 'heart', 'heartEmpty',
            // 🧱 瓦片资源
            'floor', 'wall', 'corridor', 'door'
        ];
        
        console.log(`🔄 批量预加载资源: ${coreAssets.join(', ')}`);
        
        for (const assetName of coreAssets) {
            try {
                // 🎯 使用和getSpriteFrame相同的逻辑
                const spriteFrame = await this.getSpriteFrame(assetName);
                this.spriteFrameCache.set(assetName, spriteFrame);
                console.log(`✅ 核心资源 ${assetName} 预加载成功`);
            } catch (error) {
                console.warn(`⚠️ 核心资源 ${assetName} 加载失败，将使用程序化图标`);
            }
        }
    }
    
    /**
     * 获取SpriteFrame - 优先使用美术资源，fallback到程序化图标
     */
    static async getSpriteFrame(assetName: string): Promise<SpriteFrame> {
        try {
            // 检查缓存
            if (this.spriteFrameCache.has(assetName)) {
                return this.spriteFrameCache.get(assetName)!;
            }
            
            // 方案1：尝试从预加载器获取
            const preloader = ArtResourcePreloader.getInstance();
            console.log(`🔍 预加载器状态: ${preloader ? '存在' : '不存在'}`);
            if (preloader) {
                const hasSprite = preloader.hasSprite(assetName);
                console.log(`🔍 ${assetName} 在预加载器中: ${hasSprite ? '存在' : '不存在'}`);
                if (hasSprite) {
                    const spriteFrame = preloader.getSpriteFrame(assetName);
                    if (spriteFrame) {
                        this.spriteFrameCache.set(assetName, spriteFrame);
                        console.log(`✅ 使用预配置美术资源: ${assetName}`);
                        return spriteFrame;
                    }
                }
            }
            
            // 方案2：fallback到程序化图标
            console.log(`🎨 为 ${assetName} 创建程序化图标`);
            const fallbackFrame = this.getFallbackSpriteFrame(assetName);
            this.spriteFrameCache.set(assetName, fallbackFrame);
            return fallbackFrame;
        } catch (error) {
            // 紧急fallback：确保无论如何都返回有效的SpriteFrame
            console.error(`❌ ArtResourceManager.getSpriteFrame(${assetName}) 严重错误:`, error);
            console.log(`🆘 紧急创建程序化图标: ${assetName}`);
            const emergencyFallback = this.getFallbackSpriteFrame(assetName);
            return emergencyFallback;
        }
    }
    
    /**
     * 加载美术资源
     */
    private static loadSpriteFrame(assetName: string): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            const path = this.ASSET_PATHS[assetName as keyof typeof this.ASSET_PATHS];
            if (!path) {
                reject(new Error(`未知的资源名称: ${assetName}`));
                return;
            }
            
            resources.load(path, SpriteFrame, (error, spriteFrame) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(spriteFrame);
                }
            });
        });
    }
    
    /**
     * 获取程序化图标作为fallback
     */
    private static getFallbackSpriteFrame(assetName: string): SpriteFrame {
        switch (assetName) {
            case 'player':
                return TextureGenerator.createPlayerTexture(40);
            case 'enemy':
                return TextureGenerator.createEnemyTexture(32);
            case 'treasureChest':
                return TextureGenerator.createTreasureTexture(32);
            case 'heart':
                return TextureGenerator.createHealthTexture(24);
            case 'heartEmpty':
                return TextureGenerator.createHealthTexture(24, true);
            case 'potion':
                return TextureGenerator.createPotionTexture(24);
            case 'weapon':
                return TextureGenerator.createWeaponTexture(24);
            case 'armor':
                return TextureGenerator.createArmorTexture(24);
            // 🧱 瓦片程序化图标
            case 'floor':
                return TextureGenerator.createTileTexture('floor', 32);
            case 'wall':
                return TextureGenerator.createTileTexture('wall', 32);
            case 'corridor':
                return TextureGenerator.createTileTexture('corridor', 32);
            case 'door':
                return TextureGenerator.createTileTexture('door', 32);
            default:
                console.warn(`⚠️ 未定义的fallback图标: ${assetName}`);
                return TextureGenerator.createPlayerTexture(32); // 使用默认的玩家图标作为fallback
        }
    }
    
    /**
     * 清理资源缓存
     */
    static clearCache(): void {
        this.spriteFrameCache.clear();
        console.log('🧹 美术资源缓存已清理');
    }

    /**
     * 🔧 强制重新加载指定资源（清除缓存）
     */
    static async forceReloadResource(assetName: string): Promise<SpriteFrame> {
        console.log(`🔧 强制重新加载资源: ${assetName}`);
        
        // 从缓存中移除
        if (this.spriteFrameCache.has(assetName)) {
            this.spriteFrameCache.delete(assetName);
            console.log(`🗑️ 已从缓存中移除: ${assetName}`);
        }
        
        // 重新加载
        const spriteFrame = await this.getSpriteFrame(assetName);
        console.log(`🔄 重新加载完成: ${assetName}`);
        return spriteFrame;
    }
    
    /**
     * 检查美术资源是否存在
     */
    static async checkAssetExists(assetName: string): Promise<boolean> {
        try {
            await this.loadSpriteFrame(assetName);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * 批量预加载资源
     */
    static async preloadAssets(assetNames: string[]): Promise<void> {
        console.log(`🔄 批量预加载资源: ${assetNames.join(', ')}`);
        
        const promises = assetNames.map(async (name) => {
            try {
                await this.getSpriteFrame(name);
            } catch (error) {
                console.warn(`⚠️ 资源 ${name} 预加载失败:`, error);
            }
        });
        
        await Promise.all(promises);
        console.log('✅ 批量预加载完成');
    }
    
    /**
     * 获取资源使用统计
     */
    static getResourceStats(): { total: number, cached: number, artAssets: number, fallbacks: number } {
        const total = Object.keys(this.ASSET_PATHS).length;
        const cached = this.spriteFrameCache.size;
        
        // 这里可以进一步统计美术资源和fallback的比例
        return {
            total,
            cached,
            artAssets: 0, // TODO: 实现实际统计
            fallbacks: 0  // TODO: 实现实际统计
        };
    }
}

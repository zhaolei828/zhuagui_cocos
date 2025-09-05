import { _decorator, Component, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 美术资源预加载器 - 在编辑器中配置美术资源
 * 提供编辑器可视化配置，避免 resources.load() 路径问题
 */
@ccclass('ArtResourcePreloader')
export class ArtResourcePreloader extends Component {
    
    // ============ 角色资源 ============
    // ✅ 已配置
    @property({ type: SpriteFrame, tooltip: "玩家角色图片" })
    playerSprite: SpriteFrame = null!;
    
    // 🔮 动画扩展 (未来功能)
    @property({ type: SpriteFrame, tooltip: "玩家空闲动画 (未配置)" })
    playerIdleSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "玩家行走动画 (未配置)" })
    playerWalkSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "玩家攻击动画 (未配置)" })
    playerAttackSprite: SpriteFrame = null!;
    
    // ============ 敌人资源 ============
    // ✅ 已配置
    @property({ type: SpriteFrame, tooltip: "敌人图片" })
    enemySprite: SpriteFrame = null!;
    
    // 🔮 动画扩展 (未来功能)
    @property({ type: SpriteFrame, tooltip: "敌人空闲动画 (未配置)" })
    enemyIdleSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "敌人行走动画 (未配置)" })
    enemyWalkSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "敌人攻击动画 (未配置)" })
    enemyAttackSprite: SpriteFrame = null!;
    
    // ============ 道具资源 ============
    // ✅ 已配置
    @property({ type: SpriteFrame, tooltip: "宝箱图片" })
    treasureChestSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "打开的宝箱" })
    treasureChestOpenSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "药水图片" })
    potionSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "武器图片" })
    weaponSprite: SpriteFrame = null!;
    
    // 🔮 待配置
    @property({ type: SpriteFrame, tooltip: "护甲图片 (未配置)" })
    armorSprite: SpriteFrame = null!;
    
    // ============ UI资源 ============
    // 🔮 待配置 (UI系统未完善)
    @property({ type: SpriteFrame, tooltip: "生命值图标 (未配置)" })
    heartSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "空生命值图标 (未配置)" })
    heartEmptySprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "背包槽位 (未配置)" })
    inventorySlotSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "按钮背景 (未配置)" })
    buttonSprite: SpriteFrame = null!;
    
    // ============ 特效资源 ============
    // 🔮 待配置 (特效系统未完善)
    @property({ type: SpriteFrame, tooltip: "爆炸特效 (未配置)" })
    explosionSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "治疗特效 (未配置)" })
    healSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "伤害特效 (未配置)" })
    damageSprite: SpriteFrame = null!;
    
    // ============ 地图瓦片资源 ============
    // ✅ 已配置
    @property({ type: SpriteFrame, tooltip: "地板瓦片" })
    floorSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "墙壁瓦片" })
    wallSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "走廊瓦片" })
    corridorSprite: SpriteFrame = null!;
    
    @property({ type: SpriteFrame, tooltip: "门瓦片" })
    doorSprite: SpriteFrame = null!;
    
    // 单例实例
    private static instance: ArtResourcePreloader = null!;
    
    onLoad() {
        ArtResourcePreloader.instance = this;
        console.log('🎨 ArtResourcePreloader 预加载器已初始化');
    }
    
    /**
     * 获取预加载器实例
     */
    public static getInstance(): ArtResourcePreloader | null {
        return ArtResourcePreloader.instance;
    }
    
    /**
     * 根据资源名称获取 SpriteFrame
     */
    public getSpriteFrame(assetName: string): SpriteFrame | null {
        try {
            const spriteMap: { [key: string]: SpriteFrame } = {
                // 角色
                'player': this.playerSprite,
                'playerIdle': this.playerIdleSprite,
                'playerWalk': this.playerWalkSprite,
                'playerAttack': this.playerAttackSprite,
                
                // 敌人
                'enemy': this.enemySprite,
                'enemyIdle': this.enemyIdleSprite,
                'enemyWalk': this.enemyWalkSprite,
                'enemyAttack': this.enemyAttackSprite,
                
                // 道具
                'treasureChest': this.treasureChestSprite,
                'treasureChestOpen': this.treasureChestOpenSprite,
                'potion': this.potionSprite,
                'weapon': this.weaponSprite,
                'armor': this.armorSprite,
                
                // UI
                'heart': this.heartSprite,
                'heartEmpty': this.heartEmptySprite,
                'inventorySlot': this.inventorySlotSprite,
                'button': this.buttonSprite,
                
                // 特效
                'explosion': this.explosionSprite,
                'heal': this.healSprite,
                'damage': this.damageSprite,
                
                // 地图瓦片
                'floor': this.floorSprite,
                'wall': this.wallSprite,
                'corridor': this.corridorSprite,
                'door': this.doorSprite  // 恢复使用你配置的door.png
            };
            
            const sprite = spriteMap[assetName];
            
            
            return sprite && sprite !== null ? sprite : null;
        } catch (error) {
            console.warn(`⚠️ ArtResourcePreloader.getSpriteFrame(${assetName}) 出错:`, error);
            return null;
        }
    }
    
    /**
     * 检查资源是否已配置
     */
    public hasSprite(assetName: string): boolean {
        try {
            const sprite = this.getSpriteFrame(assetName);
            return sprite !== null && sprite !== undefined;
        } catch (error) {
            console.warn(`⚠️ ArtResourcePreloader.hasSprite(${assetName}) 出错:`, error);
            return false;
        }
    }
}

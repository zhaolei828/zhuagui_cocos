import { _decorator, Component, Node, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { ArtResourceManager } from '../utils/ArtResourceManager';
import { InventoryManager } from '../managers/InventoryManager';

const { ccclass, property } = _decorator;

/**
 * 装备管理器 - 管理玩家身上的装备显示和效果
 */
@ccclass('EquipmentManager')
export class EquipmentManager extends Component {
    
    @property({ type: Node, tooltip: "玩家节点引用" })
    player: Node = null!;
    
    @property({ type: InventoryManager, tooltip: "背包管理器引用" })
    inventoryManager: InventoryManager = null!;
    
    // 装备槽位节点
    private weaponSlot: Node = null!;
    private armorSlot: Node = null!;
    
    // 当前装备的物品
    private currentWeapon: any = null;
    private currentArmor: any = null;
    
    // 装备效果
    private weaponDamageBonus: number = 0;
    private armorDefenseBonus: number = 0;
    
    start() {
        this.initializeEquipmentSlots();
        this.setupEventListeners();
    }
    
    /**
     * 初始化装备槽位
     */
    private initializeEquipmentSlots(): void {
        if (!this.player) {
            console.error('❌ EquipmentManager: 玩家节点未设置');
            return;
        }
        
        // 创建武器槽位 - 根据玩家大小调整位置
        this.weaponSlot = this.createEquipmentSlot('WeaponSlot');
        // 🎯 武器位置：玩家右侧，稍微向前突出，显示在玩家层级之上
        this.weaponSlot.setPosition(22, 8, 1); // 右侧22像素，上方8像素
        this.player.addChild(this.weaponSlot);
        
        // 创建护甲槽位 - 根据玩家大小调整位置
        this.armorSlot = this.createEquipmentSlot('ArmorSlot');
        // 🎯 护甲位置：玩家身后稍微扩大，形成保护光环效果
        this.armorSlot.setPosition(0, 0, -1); // 居中，显示在玩家层级之后
        this.player.addChild(this.armorSlot);
        
        console.log('🎒 装备槽位初始化完成');
    }
    
    /**
     * 创建装备槽位节点
     */
    private createEquipmentSlot(name: string): Node {
        const slot = new Node(name);
        
        // 添加UITransform组件
        const transform = slot.addComponent(UITransform);
        // 🎯 根据玩家大小调整装备大小 - 玩家是40x40
        const equipmentSize = name === 'WeaponSlot' ? 32 : 48; // 武器32x32，护甲48x48形成保护光环
        transform.setContentSize(equipmentSize, equipmentSize);
        
        // 添加Sprite组件
        const sprite = slot.addComponent(Sprite);
        // 初始状态为透明
        sprite.color = sprite.color.clone().set(255, 255, 255, 0);
        
        return slot;
    }
    
    /**
     * 设置事件监听
     */
    private setupEventListeners(): void {
        // 监听背包物品使用事件
        if (this.inventoryManager) {
            // 假设背包管理器有物品使用事件
            // this.inventoryManager.on('item-used', this.onItemUsed, this);
        }
    }
    
    /**
     * 装备武器
     */
    public equipWeapon(weaponItem: any): boolean {
        try {
            console.log(`⚔️ 尝试装备武器: ${weaponItem.name}`);
            
            // 卸下当前武器
            if (this.currentWeapon) {
                this.unequipWeapon();
            }
            
            // 装备新武器
            this.currentWeapon = weaponItem;
            this.updateWeaponVisual();
            this.applyWeaponEffects();
            
            console.log(`✅ 武器装备成功: ${weaponItem.name}`);
            console.log(`⚔️ 攻击力加成: +${this.weaponDamageBonus}`);
            
            return true;
        } catch (error) {
            console.error('❌ 装备武器失败:', error);
            return false;
        }
    }
    
    /**
     * 装备护甲
     */
    public equipArmor(armorItem: any): boolean {
        try {
            console.log(`🛡️ 尝试装备护甲: ${armorItem.name}`);
            
            // 卸下当前护甲
            if (this.currentArmor) {
                this.unequipArmor();
            }
            
            // 装备新护甲
            this.currentArmor = armorItem;
            this.updateArmorVisual();
            this.applyArmorEffects();
            
            console.log(`✅ 护甲装备成功: ${armorItem.name}`);
            console.log(`🛡️ 防御力加成: +${this.armorDefenseBonus}`);
            
            return true;
        } catch (error) {
            console.error('❌ 装备护甲失败:', error);
            return false;
        }
    }
    
    /**
     * 卸下武器
     */
    public unequipWeapon(): boolean {
        if (!this.currentWeapon) return false;
        
        try {
            console.log(`⚔️ 卸下武器: ${this.currentWeapon.name}`);
            
            // 移除武器效果
            this.removeWeaponEffects();
            
            // 隐藏武器视觉
            const weaponSprite = this.weaponSlot.getComponent(Sprite);
            if (weaponSprite) {
                weaponSprite.color = weaponSprite.color.clone().set(255, 255, 255, 0);
            }
            
            // 如果有背包管理器，将武器放回背包
            if (this.inventoryManager && this.currentWeapon) {
                // this.inventoryManager.addItem(this.currentWeapon);
            }
            
            this.currentWeapon = null;
            console.log('✅ 武器已卸下');
            
            return true;
        } catch (error) {
            console.error('❌ 卸下武器失败:', error);
            return false;
        }
    }
    
    /**
     * 卸下护甲
     */
    public unequipArmor(): boolean {
        if (!this.currentArmor) return false;
        
        try {
            console.log(`🛡️ 卸下护甲: ${this.currentArmor.name}`);
            
            // 移除护甲效果
            this.removeArmorEffects();
            
            // 隐藏护甲视觉
            const armorSprite = this.armorSlot.getComponent(Sprite);
            if (armorSprite) {
                armorSprite.color = armorSprite.color.clone().set(255, 255, 255, 0);
            }
            
            // 如果有背包管理器，将护甲放回背包
            if (this.inventoryManager && this.currentArmor) {
                // this.inventoryManager.addItem(this.currentArmor);
            }
            
            this.currentArmor = null;
            console.log('✅ 护甲已卸下');
            
            return true;
        } catch (error) {
            console.error('❌ 卸下护甲失败:', error);
            return false;
        }
    }
    
    /**
     * 更新武器视觉效果
     */
    private async updateWeaponVisual(): Promise<void> {
        if (!this.currentWeapon || !this.weaponSlot) return;
        
        try {
            const sprite = this.weaponSlot.getComponent(Sprite);
            if (!sprite) return;
            
            // 尝试加载武器美术资源
            let spriteFrame: SpriteFrame | null = null;
            
            // 根据武器类型获取对应资源
            const weaponType = this.currentWeapon.type || 'weapon';
            spriteFrame = await ArtResourceManager.getSpriteFrame(weaponType);
            
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
                sprite.color = sprite.color.clone().set(255, 255, 255, 255); // 显示武器
                console.log(`✅ 武器视觉更新完成: ${weaponType}`);
            } else {
                console.log(`⚠️ 武器美术资源未找到，使用默认显示`);
                // 使用默认武器颜色指示
                sprite.color = sprite.color.clone().set(255, 215, 0, 200); // 金色半透明
            }
        } catch (error) {
            console.error('❌ 更新武器视觉失败:', error);
        }
    }
    
    /**
     * 更新护甲视觉效果
     */
    private async updateArmorVisual(): Promise<void> {
        if (!this.currentArmor || !this.armorSlot) return;
        
        try {
            const sprite = this.armorSlot.getComponent(Sprite);
            if (!sprite) return;
            
            // 尝试加载护甲美术资源
            let spriteFrame: SpriteFrame | null = null;
            
            // 根据护甲类型获取对应资源
            const armorType = this.currentArmor.type || 'armor';
            spriteFrame = await ArtResourceManager.getSpriteFrame(armorType);
            
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
                sprite.color = sprite.color.clone().set(255, 255, 255, 100); // 更透明的显示
                console.log(`✅ 护甲视觉更新完成: ${armorType}`);
            } else {
                console.log(`⚠️ 护甲美术资源未找到，使用默认显示`);
                // 使用默认护甲颜色指示 - 更大更明显的保护光环效果
                sprite.color = sprite.color.clone().set(100, 150, 255, 120); // 浅蓝色光环效果
            }
        } catch (error) {
            console.error('❌ 更新护甲视觉失败:', error);
        }
    }
    
    /**
     * 应用武器效果
     */
    private applyWeaponEffects(): void {
        if (!this.currentWeapon) return;
        
        // 计算攻击力加成
        this.weaponDamageBonus = this.currentWeapon.attackPower || 10;
        
        // 如果玩家有CombatComponent，应用加成
        const combatComponent = this.player?.getComponent('CombatComponent');
        if (combatComponent && typeof combatComponent.addAttackBonus === 'function') {
            combatComponent.addAttackBonus(this.weaponDamageBonus);
        }
    }
    
    /**
     * 应用护甲效果
     */
    private applyArmorEffects(): void {
        if (!this.currentArmor) return;
        
        // 计算防御力加成
        this.armorDefenseBonus = this.currentArmor.defense || 5;
        
        // 如果玩家有HealthComponent，应用防御加成
        const healthComponent = this.player?.getComponent('HealthComponent');
        if (healthComponent && typeof healthComponent.addDefenseBonus === 'function') {
            healthComponent.addDefenseBonus(this.armorDefenseBonus);
        }
    }
    
    /**
     * 移除武器效果
     */
    private removeWeaponEffects(): void {
        if (this.weaponDamageBonus === 0) return;
        
        // 如果玩家有CombatComponent，移除加成
        const combatComponent = this.player?.getComponent('CombatComponent');
        if (combatComponent && typeof combatComponent.removeAttackBonus === 'function') {
            combatComponent.removeAttackBonus(this.weaponDamageBonus);
        }
        
        this.weaponDamageBonus = 0;
    }
    
    /**
     * 移除护甲效果
     */
    private removeArmorEffects(): void {
        if (this.armorDefenseBonus === 0) return;
        
        // 如果玩家有HealthComponent，移除防御加成
        const healthComponent = this.player?.getComponent('HealthComponent');
        if (healthComponent && typeof healthComponent.removeDefenseBonus === 'function') {
            healthComponent.removeDefenseBonus(this.armorDefenseBonus);
        }
        
        this.armorDefenseBonus = 0;
    }
    
    /**
     * 获取当前装备信息
     */
    public getEquipmentInfo(): { weapon: any, armor: any, totalAttackBonus: number, totalDefenseBonus: number } {
        return {
            weapon: this.currentWeapon,
            armor: this.currentArmor,
            totalAttackBonus: this.weaponDamageBonus,
            totalDefenseBonus: this.armorDefenseBonus
        };
    }
    
    /**
     * 装备物品（通用接口）
     */
    public equipItem(item: any): boolean {
        if (!item || !item.type) {
            console.warn('⚠️ 无效的装备物品');
            return false;
        }
        
        switch (item.type) {
            case 'weapon':
                return this.equipWeapon(item);
            case 'armor':
                return this.equipArmor(item);
            default:
                console.warn(`⚠️ 未知的装备类型: ${item.type}`);
                return false;
        }
    }
    
    /**
     * 创建测试武器
     */
    public static createTestWeapon(): any {
        return {
            name: '测试之剑',
            type: 'weapon',
            attackPower: 15,
            description: '一把锋利的测试用剑'
        };
    }
    
    /**
     * 创建测试护甲
     */
    public static createTestArmor(): any {
        return {
            name: '测试护甲',
            type: 'armor',
            defense: 8,
            description: '坚固的测试用护甲'
        };
    }
}

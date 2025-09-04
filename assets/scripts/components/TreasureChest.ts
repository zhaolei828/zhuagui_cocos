import { _decorator, Component, Node, Sprite, Color } from 'cc';
import { InventoryManager } from '../managers/InventoryManager';
import { ItemData, ItemType, ItemRarity } from './Item';
import { AudioManager } from '../managers/AudioManager';
import { AnimationComponent } from './AnimationComponent';
import { LevelManager } from '../managers/LevelManager';

const { ccclass, property } = _decorator;

/**
 * 宝箱组件
 */
@ccclass('TreasureChest')
export class TreasureChest extends Component {
    
    @property({ tooltip: "是否已经被打开" })
    private isOpened: boolean = false;
    
    @property({ tooltip: "宝箱稀有度" })
    rarity: ItemRarity = ItemRarity.COMMON;
    
    @property({ tooltip: "交互范围" })
    interactionRange: number = 80;
    
    @property({ tooltip: "玩家节点" })
    player: Node = null!;
    
    @property({ tooltip: "背包管理器" })
    inventoryManager: InventoryManager = null!;
    
    private sprite: Sprite = null!;
    private animationComponent: AnimationComponent = null!;
    
    start() {
        this.sprite = this.getComponent(Sprite);
        this.animationComponent = this.getComponent(AnimationComponent);
        this.updateVisual();
    }
    
    update(deltaTime: number) {
        if (this.isOpened || !this.player) return;
        
        // 检查玩家距离
        const distance = this.node.getPosition().subtract(this.player.getPosition()).length();
        if (distance <= this.interactionRange) {
            this.showInteractionHint();
        }
    }
    
    /**
     * 尝试打开宝箱
     */
    tryOpen(playerNode: Node): boolean {
        if (this.isOpened) {
            console.log('📦 宝箱已经被打开过了');
            return false;
        }
        
        const distance = this.node.getPosition().subtract(playerNode.getPosition()).length();
        if (distance > this.interactionRange) {
            console.log('📦 距离宝箱太远，无法打开');
            return false;
        }
        
        this.openChest();
        return true;
    }
    
    /**
     * 打开宝箱
     */
    private openChest(): void {
        this.isOpened = true;
        console.log(`📦 打开宝箱 (稀有度: ${this.rarity})`);
        
        // 播放开箱音效
        AudioManager.playSFX('chest_open');
        
        // 播放开箱动画
        if (this.animationComponent) {
            this.animationComponent.playAnimation('interaction' as any);
        }
        
        // 生成道具
        const loot = this.generateLoot();
        
        // 添加到背包
        if (this.inventoryManager) {
            for (const item of loot) {
                this.inventoryManager.addItem(item.data, item.quantity);
            }
        }
        
        // 记录宝箱收集到关卡系统
        LevelManager.recordTreasureCollected();
        
        // 更新视觉效果
        this.updateVisual();
        
        // 播放打开动画/音效
        this.playOpenEffect();
    }
    
    /**
     * 生成战利品
     */
    private generateLoot(): { data: ItemData, quantity: number }[] {
        const loot: { data: ItemData, quantity: number }[] = [];
        
        // 根据稀有度生成不同的道具
        switch (this.rarity) {
            case ItemRarity.COMMON:
                loot.push(...this.generateCommonLoot());
                break;
            case ItemRarity.RARE:
                loot.push(...this.generateRareLoot());
                break;
            case ItemRarity.EPIC:
                loot.push(...this.generateEpicLoot());
                break;
            case ItemRarity.LEGENDARY:
                loot.push(...this.generateLegendaryLoot());
                break;
        }
        
        return loot;
    }
    
    /**
     * 生成普通战利品
     */
    private generateCommonLoot(): { data: ItemData, quantity: number }[] {
        const loot = [];
        
        // 生命药水
        if (Math.random() < 0.7) {
            loot.push({
                data: {
                    id: 'health_potion',
                    name: '生命药水',
                    description: '恢复50点生命值',
                    type: ItemType.CONSUMABLE,
                    rarity: ItemRarity.COMMON,
                    value: 10,
                    stackable: true,
                    maxStack: 10,
                    effects: { health: 50 }
                },
                quantity: Math.floor(Math.random() * 3) + 1
            });
        }
        
        // 金币（材料）
        if (Math.random() < 0.9) {
            loot.push({
                data: {
                    id: 'gold_coin',
                    name: '金币',
                    description: '通用货币',
                    type: ItemType.MATERIAL,
                    rarity: ItemRarity.COMMON,
                    value: 1,
                    stackable: true,
                    maxStack: 999
                },
                quantity: Math.floor(Math.random() * 50) + 10
            });
        }
        
        return loot;
    }
    
    /**
     * 生成稀有战利品
     */
    private generateRareLoot(): { data: ItemData, quantity: number }[] {
        const loot = [...this.generateCommonLoot()];
        
        // 力量药水
        if (Math.random() < 0.5) {
            loot.push({
                data: {
                    id: 'strength_potion',
                    name: '力量药水',
                    description: '临时增加10点攻击力',
                    type: ItemType.CONSUMABLE,
                    rarity: ItemRarity.RARE,
                    value: 25,
                    stackable: true,
                    maxStack: 5,
                    effects: { attack: 10 }
                },
                quantity: Math.floor(Math.random() * 2) + 1
            });
        }
        
        // 魔法水晶
        if (Math.random() < 0.3) {
            loot.push({
                data: {
                    id: 'magic_crystal',
                    name: '魔法水晶',
                    description: '蕴含魔力的水晶',
                    type: ItemType.MATERIAL,
                    rarity: ItemRarity.RARE,
                    value: 50,
                    stackable: true,
                    maxStack: 20
                },
                quantity: Math.floor(Math.random() * 3) + 1
            });
        }
        
        return loot;
    }
    
    /**
     * 生成史诗战利品
     */
    private generateEpicLoot(): { data: ItemData, quantity: number }[] {
        const loot = [...this.generateRareLoot()];
        
        // 魔法剑
        if (Math.random() < 0.4) {
            loot.push({
                data: {
                    id: 'magic_sword',
                    name: '魔法剑',
                    description: '附有魔法的强大武器',
                    type: ItemType.WEAPON,
                    rarity: ItemRarity.EPIC,
                    value: 500,
                    stackable: false,
                    maxStack: 1,
                    effects: { attack: 35, speed: 5 }
                },
                quantity: 1
            });
        }
        
        return loot;
    }
    
    /**
     * 生成传说战利品
     */
    private generateLegendaryLoot(): { data: ItemData, quantity: number }[] {
        const loot = [...this.generateEpicLoot()];
        
        // 传说武器
        if (Math.random() < 0.6) {
            loot.push({
                data: {
                    id: 'legendary_blade',
                    name: '传说之刃',
                    description: '传说中的神器，拥有无与伦比的力量',
                    type: ItemType.WEAPON,
                    rarity: ItemRarity.LEGENDARY,
                    value: 2000,
                    stackable: false,
                    maxStack: 1,
                    effects: { attack: 80, speed: 15, health: 50 }
                },
                quantity: 1
            });
        }
        
        return loot;
    }
    
    /**
     * 显示交互提示
     */
    private showInteractionHint(): void {
        // 这里可以显示一个提示UI，比如"按E键打开宝箱"
        // 暂时只在控制台输出
        if (!this.isOpened) {
            // console.log('💡 按空格键打开宝箱');
        }
    }
    
    /**
     * 更新视觉效果
     */
    private updateVisual(): void {
        if (!this.sprite) return;
        
        if (this.isOpened) {
            // 已打开的宝箱变为灰色
            this.sprite.color = Color.GRAY;
        } else {
            // 根据稀有度设置颜色
            switch (this.rarity) {
                case ItemRarity.COMMON:
                    this.sprite.color = Color.YELLOW;
                    break;
                case ItemRarity.RARE:
                    this.sprite.color = Color.BLUE;
                    break;
                case ItemRarity.EPIC:
                    this.sprite.color = Color.MAGENTA;
                    break;
                case ItemRarity.LEGENDARY:
                    this.sprite.color = Color.RED;
                    break;
            }
        }
    }
    
    /**
     * 播放打开特效
     */
    private playOpenEffect(): void {
        // 这里可以添加粒子特效、音效等
        console.log('✨ 播放宝箱打开特效');
        
        // 简单的闪烁效果
        const originalColor = this.sprite.color.clone();
        this.sprite.color = Color.WHITE;
        
        this.scheduleOnce(() => {
            this.sprite.color = originalColor;
        }, 0.2);
    }
}

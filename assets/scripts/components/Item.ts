import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 道具类型
 */
export enum ItemType {
    CONSUMABLE = 'consumable', // 消耗品
    WEAPON = 'weapon',         // 武器
    ARMOR = 'armor',           // 护甲
    MATERIAL = 'material'      // 材料
}

/**
 * 道具稀有度
 */
export enum ItemRarity {
    COMMON = 'common',     // 普通 - 白色
    RARE = 'rare',         // 稀有 - 蓝色
    EPIC = 'epic',         // 史诗 - 紫色
    LEGENDARY = 'legendary' // 传说 - 橙色
}

/**
 * 道具数据接口
 */
export interface ItemData {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    iconPath?: string;
    value: number;
    stackable: boolean;
    maxStack: number;
    
    // 属性效果
    effects?: {
        health?: number;
        attack?: number;
        defense?: number;
        speed?: number;
    };
}

/**
 * 道具组件
 */
@ccclass('Item')
export class Item extends Component {
    
    @property({ tooltip: "道具数据" })
    private _itemData: ItemData = null!;
    
    @property({ tooltip: "道具数量" })
    private _quantity: number = 1;
    
    get itemData(): ItemData {
        return this._itemData;
    }
    
    get quantity(): number {
        return this._quantity;
    }
    
    /**
     * 设置道具数据
     */
    setItemData(data: ItemData, quantity: number = 1): void {
        this._itemData = data;
        this._quantity = Math.min(quantity, data.maxStack);
        this.updateVisual();
    }
    
    /**
     * 增加道具数量
     */
    addQuantity(amount: number): number {
        const oldQuantity = this._quantity;
        this._quantity = Math.min(this._quantity + amount, this._itemData.maxStack);
        return this._quantity - oldQuantity; // 返回实际增加的数量
    }
    
    /**
     * 减少道具数量
     */
    removeQuantity(amount: number): number {
        const oldQuantity = this._quantity;
        this._quantity = Math.max(0, this._quantity - amount);
        return oldQuantity - this._quantity; // 返回实际减少的数量
    }
    
    /**
     * 使用道具
     */
    use(target?: Node): boolean {
        if (this._quantity <= 0 || !this._itemData) {
            return false;
        }
        
        const success = this.applyEffect(target);
        if (success && this._itemData.type === ItemType.CONSUMABLE) {
            this.removeQuantity(1);
        }
        
        return success;
    }
    
    /**
     * 应用道具效果
     */
    private applyEffect(target?: Node): boolean {
        if (!this._itemData.effects) {
            return false;
        }
        
        const effects = this._itemData.effects;
        console.log(`🎒 使用道具: ${this._itemData.name}`);
        
        // 这里可以根据不同效果类型进行处理
        if (effects.health && target) {
            // 恢复生命值的逻辑
            console.log(`💚 恢复生命值: ${effects.health}`);
        }
        
        if (effects.attack) {
            console.log(`⚔️ 增加攻击力: ${effects.attack}`);
        }
        
        return true;
    }
    
    /**
     * 更新视觉效果
     */
    private updateVisual(): void {
        // 可以在这里更新道具的视觉表现
        // 比如根据稀有度改变颜色等
    }
    
    /**
     * 获取道具信息文本
     */
    getTooltipText(): string {
        let text = `${this._itemData.name}\n`;
        text += `${this._itemData.description}\n`;
        text += `稀有度: ${this._itemData.rarity}\n`;
        
        if (this._itemData.effects) {
            text += "效果:\n";
            const effects = this._itemData.effects;
            if (effects.health) text += `生命值: +${effects.health}\n`;
            if (effects.attack) text += `攻击力: +${effects.attack}\n`;
            if (effects.defense) text += `防御力: +${effects.defense}\n`;
            if (effects.speed) text += `移动速度: +${effects.speed}\n`;
        }
        
        if (this._itemData.stackable) {
            text += `数量: ${this._quantity}/${this._itemData.maxStack}`;
        }
        
        return text;
    }
}

import { _decorator, Component, Node } from 'cc';
import { Item, ItemData, ItemType, ItemRarity } from '../components/Item';

const { ccclass, property } = _decorator;

/**
 * 背包槽位
 */
interface InventorySlot {
    item: Item | null;
    quantity: number;
}

/**
 * 背包管理器
 */
@ccclass('InventoryManager')
export class InventoryManager extends Component {
    
    @property({ tooltip: "背包容量" })
    capacity: number = 20;
    
    private slots: InventorySlot[] = [];
    
    // 事件回调
    public onInventoryChanged: () => void = null!;
    public onItemAdded: (item: ItemData, quantity: number) => void = null!;
    public onItemRemoved: (item: ItemData, quantity: number) => void = null!;
    
    start() {
        this.initializeInventory();
        this.createDefaultItems(); // 创建一些默认道具用于测试
    }
    
    /**
     * 初始化背包
     */
    private initializeInventory(): void {
        this.slots = [];
        for (let i = 0; i < this.capacity; i++) {
            this.slots.push({ item: null, quantity: 0 });
        }
    }
    
    /**
     * 添加道具到背包
     */
    addItem(itemData: ItemData, quantity: number = 1): boolean {
        let remainingQuantity = quantity;
        
        // 首先尝试叠加到现有物品
        if (itemData.stackable) {
            for (const slot of this.slots) {
                if (slot.item && slot.item.itemData.id === itemData.id) {
                    const canAdd = Math.min(remainingQuantity, itemData.maxStack - slot.quantity);
                    if (canAdd > 0) {
                        slot.quantity += canAdd;
                        slot.item.addQuantity(canAdd);
                        remainingQuantity -= canAdd;
                        
                        if (remainingQuantity <= 0) break;
                    }
                }
            }
        }
        
        // 如果还有剩余，放入空槽位
        while (remainingQuantity > 0) {
            const emptySlot = this.findEmptySlot();
            if (!emptySlot) {
                console.log('❌ 背包已满，无法添加更多道具');
                return false;
            }
            
            const addQuantity = Math.min(remainingQuantity, itemData.maxStack);
            const itemNode = new Node(itemData.name);
            const itemComponent = itemNode.addComponent(Item);
            itemComponent.setItemData(itemData, addQuantity);
            
            emptySlot.item = itemComponent;
            emptySlot.quantity = addQuantity;
            remainingQuantity -= addQuantity;
        }
        
        console.log(`🎒 添加道具: ${itemData.name} x${quantity}`);
        this.onItemAdded && this.onItemAdded(itemData, quantity);
        this.onInventoryChanged && this.onInventoryChanged();
        
        return true;
    }
    
    /**
     * 从背包移除道具
     */
    removeItem(itemId: string, quantity: number = 1): boolean {
        let remainingQuantity = quantity;
        
        for (const slot of this.slots) {
            if (slot.item && slot.item.itemData.id === itemId && remainingQuantity > 0) {
                const removeQuantity = Math.min(remainingQuantity, slot.quantity);
                
                slot.item.removeQuantity(removeQuantity);
                slot.quantity -= removeQuantity;
                remainingQuantity -= removeQuantity;
                
                // 如果数量为0，清空槽位
                if (slot.quantity <= 0) {
                    slot.item.node.destroy();
                    slot.item = null;
                }
            }
        }
        
        if (remainingQuantity < quantity) {
            const actualRemoved = quantity - remainingQuantity;
            console.log(`🎒 移除道具: ${itemId} x${actualRemoved}`);
            this.onInventoryChanged && this.onInventoryChanged();
            return true;
        }
        
        return false;
    }
    
    /**
     * 使用道具
     */
    useItem(slotIndex: number, target?: Node): boolean {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            return false;
        }
        
        const slot = this.slots[slotIndex];
        if (!slot.item || slot.quantity <= 0) {
            return false;
        }
        
        const success = slot.item.use(target);
        if (success) {
            slot.quantity = slot.item.quantity;
            
            // 如果是消耗品且用完了，清空槽位
            if (slot.quantity <= 0) {
                slot.item.node.destroy();
                slot.item = null;
            }
            
            this.onInventoryChanged && this.onInventoryChanged();
        }
        
        return success;
    }
    
    /**
     * 获取道具数量
     */
    getItemCount(itemId: string): number {
        let count = 0;
        for (const slot of this.slots) {
            if (slot.item && slot.item.itemData.id === itemId) {
                count += slot.quantity;
            }
        }
        return count;
    }
    
    /**
     * 检查是否有道具
     */
    hasItem(itemId: string, quantity: number = 1): boolean {
        return this.getItemCount(itemId) >= quantity;
    }
    
    /**
     * 寻找空槽位
     */
    private findEmptySlot(): InventorySlot | null {
        for (const slot of this.slots) {
            if (!slot.item) {
                return slot;
            }
        }
        return null;
    }
    
    /**
     * 获取所有道具
     */
    getAllItems(): InventorySlot[] {
        return this.slots.filter(slot => slot.item !== null);
    }
    
    /**
     * 清空背包
     */
    clear(): void {
        for (const slot of this.slots) {
            if (slot.item) {
                slot.item.node.destroy();
                slot.item = null;
                slot.quantity = 0;
            }
        }
        this.onInventoryChanged && this.onInventoryChanged();
    }
    
    /**
     * 创建默认道具用于测试
     */
    private createDefaultItems(): void {
        // 生命药水
        const healthPotion: ItemData = {
            id: 'health_potion',
            name: '生命药水',
            description: '恢复50点生命值',
            type: ItemType.CONSUMABLE,
            rarity: ItemRarity.COMMON,
            value: 10,
            stackable: true,
            maxStack: 10,
            effects: { health: 50 }
        };
        
        // 力量药水
        const strengthPotion: ItemData = {
            id: 'strength_potion',
            name: '力量药水',
            description: '临时增加10点攻击力',
            type: ItemType.CONSUMABLE,
            rarity: ItemRarity.RARE,
            value: 25,
            stackable: true,
            maxStack: 5,
            effects: { attack: 10 }
        };
        
        // 铁剑
        const ironSword: ItemData = {
            id: 'iron_sword',
            name: '铁剑',
            description: '一把普通的铁剑，增加15点攻击力',
            type: ItemType.WEAPON,
            rarity: ItemRarity.COMMON,
            value: 100,
            stackable: false,
            maxStack: 1,
            effects: { attack: 15 }
        };
        
        // 添加一些初始道具
        this.scheduleOnce(() => {
            this.addItem(healthPotion, 3);
            this.addItem(strengthPotion, 1);
            this.addItem(ironSword, 1);
            console.log('🎒 背包初始化完成，添加了一些初始道具');
        }, 0.1);
    }
}

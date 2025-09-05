import { _decorator, Component, Node } from 'cc';
import { AudioManager } from '../managers/AudioManager';
import { AnimationComponent } from './AnimationComponent';
import { DamageDisplay } from './DamageDisplay';
import { LevelManager } from '../managers/LevelManager';

const { ccclass, property } = _decorator;

/**
 * 血量组件 - 管理实体的生命值和状态
 */
@ccclass('HealthComponent')
export class HealthComponent extends Component {
    
    @property({ tooltip: "最大生命值" })
    maxHealth: number = 100;
    
    @property({ tooltip: "当前生命值" })
    private _currentHealth: number = 100;
    
    @property({ tooltip: "基础防御力" })
    baseDefense: number = 0;
    
    @property({ tooltip: "是否无敌" })
    isInvincible: boolean = false;
    
    @property({ tooltip: "无敌时间(秒)" })
    invincibleDuration: number = 0.1; // 🔧 临时减少无敌时间便于测试
    
    // 装备加成
    private armorDefenseBonus: number = 0;
    
    // 事件回调
    public onHealthChanged: (current: number, max: number) => void = null!;
    public onDeath: () => void = null!;
    public onDamage: (damage: number) => void = null!;
    
    private invincibleTimer: number = 0;
    private animationComponent: AnimationComponent = null!;
    
    get currentHealth(): number {
        return this._currentHealth;
    }
    
    get healthPercent(): number {
        return this._currentHealth / this.maxHealth;
    }
    
    get isDead(): boolean {
        return this._currentHealth <= 0;
    }
    
    /**
     * 获取总防御力（基础防御力 + 装备加成）
     */
    public getTotalDefense(): number {
        return this.baseDefense + this.armorDefenseBonus;
    }
    
    start() {
        this._currentHealth = this.maxHealth;
        this.animationComponent = this.getComponent(AnimationComponent);
        this.onHealthChanged && this.onHealthChanged(this._currentHealth, this.maxHealth);
    }
    
    update(deltaTime: number) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
            }
        }
    }
    
    /**
     * 受到伤害
     */
    takeDamage(damage: number): boolean {
        console.log(`🔥🔥🔥 HealthComponent.takeDamage() 被调用 - 编译验证标记：${Date.now()}`);
        console.log(`🔥🔥🔥 当前时间戳：${new Date().toLocaleTimeString()} - 这是最新代码！`);
        console.log(`🔍 调试状态: isDead=${this.isDead}, isInvincible=${this.isInvincible}, damage=${damage}`);
        if (this.isDead || this.isInvincible || damage <= 0) {
            console.log(`⚠️ takeDamage()提前返回: isDead=${this.isDead}, isInvincible=${this.isInvincible}, damage=${damage}`);
            return false;
        }
        console.log(`✅ takeDamage()通过条件检查，继续执行...`);
        
        // 🛡️ 计算防御力减免
        const totalDefense = this.getTotalDefense();
        const actualDamage = Math.max(1, damage - totalDefense); // 最少造成1点伤害
        
        this._currentHealth = Math.max(0, this._currentHealth - actualDamage);
        
        console.log(`🛡️ 防御计算: 原始伤害=${damage}, 防御力=${totalDefense}, 实际伤害=${actualDamage}`);
        console.log(`💔 ${this.node.name} 受到 ${actualDamage} 点伤害，剩余血量: ${this._currentHealth}/${this.maxHealth}`);
        
        // 播放受伤音效
        AudioManager.playSFX('hurt');
        
        // 播放受伤动画
        if (this.animationComponent) {
            this.animationComponent.playAnimation('hurt' as any);
        }
        
        // 显示伤害数字
        console.log(`🎯🎯🎯 即将调用showDamageNumber() - 验证编译状态`);
        this.showDamageNumber(actualDamage); // 显示实际伤害
        console.log(`✅✅✅ showDamageNumber()调用完成`);
        
        // 触发事件
        this.onDamage && this.onDamage(actualDamage);
        this.onHealthChanged && this.onHealthChanged(this._currentHealth, this.maxHealth);
        
        // 设置无敌时间
        this.setInvincible(this.invincibleDuration);
        
        // 检查死亡
        if (this.isDead) {
            this.handleDeath();
        }
        
        return true;
    }
    
    /**
     * 显示伤害数字
     */
    private showDamageNumber(damage: number): void {
        console.log(`🔧🔧🔧 showDamageNumber() 开始执行 - 编译验证：${Date.now()}`);
        console.log(`🔧🔧🔧 尝试创建 DamageDisplay - 这证明新代码已编译！`);
        
        // 判断是否暴击（这里简单用随机数模拟）
        const isCritical = Math.random() < 0.2; // 20%暴击率
        const damageType = isCritical ? 'critical' : 'normal';
        
        console.log(`🎨🎨🎨 准备调用 DamageDisplay.createDamageDisplay()`);
        
        try {
            // 🔧 位置修复：直接使用player节点，但要获取世界位置
            console.log(`🎯🎯🎯 伤害数字目标节点: ${this.node.name}, 位置: ${this.node.position}`);
            DamageDisplay.createDamageDisplay(this.node, damage, damageType);
            console.log(`✅✅✅ DamageDisplay.createDamageDisplay() 调用成功`);
        } catch (error) {
            console.error(`❌❌❌ DamageDisplay.createDamageDisplay() 调用失败:`, error);
        }
    }
    
    /**
     * 恢复生命值
     */
    heal(amount: number): void {
        if (this.isDead) return;
        
        const oldHealth = this._currentHealth;
        this._currentHealth = Math.min(this.maxHealth, this._currentHealth + amount);
        
        if (this._currentHealth > oldHealth) {
            console.log(`💚 ${this.node.name} 恢复 ${this._currentHealth - oldHealth} 点生命值`);
            
            // 播放治疗动画
            if (this.animationComponent) {
                this.animationComponent.playHealEffect();
            }
            
            this.onHealthChanged && this.onHealthChanged(this._currentHealth, this.maxHealth);
        }
    }
    
    /**
     * 设置无敌状态
     */
    setInvincible(duration: number): void {
        this.isInvincible = true;
        this.invincibleTimer = duration;
    }
    
    /**
     * 重置血量
     */
    resetHealth(): void {
        this._currentHealth = this.maxHealth;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.onHealthChanged && this.onHealthChanged(this._currentHealth, this.maxHealth);
    }
    
    /**
     * 处理死亡
     */
    private handleDeath(): void {
        console.log(`💀 ${this.node.name} 死亡`);
        
        // 播放死亡音效
        AudioManager.playSFX('death');
        
        // 播放死亡动画
        if (this.animationComponent) {
            this.animationComponent.playAnimation('death' as any);
        }
        
        // 如果是敌人死亡，记录到关卡系统
        if (this.node.name.includes('Enemy')) {
            LevelManager.recordEnemyKill();
        }
        
        this.onDeath && this.onDeath();
    }
    
    /**
     * 添加护甲防御力加成
     */
    public addDefenseBonus(bonus: number): void {
        this.armorDefenseBonus += bonus;
        console.log(`🛡️ 添加防御力加成: +${bonus}, 当前总防御: ${this.getTotalDefense()}`);
    }
    
    /**
     * 移除护甲防御力加成
     */
    public removeDefenseBonus(bonus: number): void {
        this.armorDefenseBonus = Math.max(0, this.armorDefenseBonus - bonus);
        console.log(`🛡️ 移除防御力加成: -${bonus}, 当前总防御: ${this.getTotalDefense()}`);
    }
    
    /**
     * 获取防御力信息
     */
    public getDefenseInfo(): { base: number, bonus: number, total: number } {
        return {
            base: this.baseDefense,
            bonus: this.armorDefenseBonus,
            total: this.getTotalDefense()
        };
    }
}

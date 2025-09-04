import { _decorator, Component, Node, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { HealthComponent } from './HealthComponent';
import { AudioManager } from '../managers/AudioManager';
import { AnimationComponent } from './AnimationComponent';

const { ccclass, property } = _decorator;

/**
 * 战斗组件 - 处理攻击和伤害逻辑
 */
@ccclass('CombatComponent')
export class CombatComponent extends Component {
    
    @property({ tooltip: "攻击力" })
    attackDamage: number = 20;
    
    @property({ tooltip: "攻击范围" })
    attackRange: number = 50;
    
    @property({ tooltip: "攻击冷却时间(秒)" })
    attackCooldown: number = 1.0;
    
    @property({ tooltip: "攻击目标标签" })
    targetTags: string[] = [];
    
    @property({ tooltip: "自动攻击" })
    autoAttack: boolean = false;
    
    private lastAttackTime: number = 0;
    private healthComponent: HealthComponent = null!;
    private animationComponent: AnimationComponent = null!;
    
    get canAttack(): boolean {
        const now = Date.now() / 1000;
        return (now - this.lastAttackTime) >= this.attackCooldown;
    }
    
    start() {
        this.healthComponent = this.getComponent(HealthComponent);
        this.animationComponent = this.getComponent(AnimationComponent);
        
        // 设置碰撞检测
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
        }
    }
    
    update(deltaTime: number) {
        if (this.autoAttack && this.canAttack) {
            this.tryAutoAttack();
        }
    }
    
    /**
     * 执行攻击
     */
    attack(target?: Node): boolean {
        console.log(`🗡️ ${this.node.name} 尝试攻击`);
        console.log(`⏰ 可以攻击: ${this.canAttack}`);
        console.log(`❤️ 已死亡: ${this.healthComponent ? this.healthComponent.isDead : '无血量组件'}`);
        
        if (!this.canAttack || (this.healthComponent && this.healthComponent.isDead)) {
            console.log('❌ 攻击被阻止：冷却中或已死亡');
            return false;
        }
        
        // 如果指定了目标，攻击特定目标
        if (target) {
            console.log(`🎯 攻击指定目标: ${target.name}`);
            return this.attackTarget(target);
        }
        
        // 否则攻击范围内的敌人
        console.log('🔍 搜索范围内的敌人');
        return this.attackInRange();
    }
    
    /**
     * 攻击指定目标
     */
    private attackTarget(target: Node): boolean {
        const distance = this.node.getPosition().subtract(target.getPosition()).length();
        if (distance > this.attackRange) {
            return false; // 超出攻击范围
        }
        
        return this.dealDamage(target);
    }
    
    /**
     * 攻击范围内的敌人
     */
    private attackInRange(): boolean {
        // 寻找最近的敌人
        const nearestEnemy = this.findNearestEnemy();
        if (nearestEnemy) {
            console.log(`🔍 找到最近的敌人: ${nearestEnemy.name}`);
            return this.attackTarget(nearestEnemy);
        }
        
        console.log('🤷‍ 攻击范围内没有敌人');
        return false;
    }
    
    /**
     * 尝试自动攻击
     */
    private tryAutoAttack(): void {
        // 寻找最近的敌人
        const nearestEnemy = this.findNearestEnemy();
        if (nearestEnemy) {
            this.attack(nearestEnemy);
        }
    }
    
    /**
     * 寻找最近的敌人
     */
    private findNearestEnemy(): Node | null {
        // TODO: 实现敌人搜索逻辑
        // 这里需要与地图系统集成
        const allEnemies = this.findAllEnemies();
        let nearestEnemy: Node | null = null;
        let minDistance = Infinity;
        
        const currentPos = this.node.getPosition();
        
        for (const enemy of allEnemies) {
            const distance = currentPos.subtract(enemy.getPosition()).length();
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        if (nearestEnemy && minDistance <= this.attackRange) {
            return nearestEnemy;
        }
        
        return null;
    }
    
    /**
     * 查找所有敌人
     */
    private findAllEnemies(): Node[] {
        const enemies: Node[] = [];
        const scene = this.node.scene;
        
        // 根据targetTags来确定攻击目标
        const searchNode = (node: Node) => {
            // 检查节点名称是否匹配targetTags
            for (const tag of this.targetTags) {
                if (node.name === tag || node.name.includes(tag)) {
                    enemies.push(node);
                    break;
                }
            }
            node.children.forEach(child => searchNode(child));
        };
        
        searchNode(scene);
        console.log(`🎯 ${this.node.name} 找到 ${enemies.length} 个目标: ${enemies.map(e => e.name).join(', ')}`);
        return enemies;
    }
    
    /**
     * 对目标造成伤害
     */
    private dealDamage(target: Node): boolean {
        const targetHealth = target.getComponent(HealthComponent);
        if (!targetHealth) {
            return false;
        }
        
        const success = targetHealth.takeDamage(this.attackDamage);
        if (success) {
            console.log(`⚔️ ${this.node.name} 攻击 ${target.name}，造成 ${this.attackDamage} 点伤害`);
            this.lastAttackTime = Date.now() / 1000;
            
            // 播放攻击音效
            AudioManager.playSFX('attack');
            
            // 播放攻击动画
            if (this.animationComponent) {
                this.animationComponent.playAnimation('attack' as any);
            }
            
            // 可以在这里添加攻击特效
            this.playAttackEffect(target);
        }
        
        return success;
    }
    
    /**
     * 播放攻击特效
     */
    private playAttackEffect(target: Node): void {
        // TODO: 添加攻击特效和音效
        console.log(`✨ 播放攻击特效`);
    }
    
    /**
     * 碰撞检测
     */
    private onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
        const otherNode = otherCollider.node;
        
        // 检查是否是攻击目标
        if (this.isValidTarget(otherNode)) {
            // 可以在这里处理近身攻击
            console.log(`🎯 ${this.node.name} 接触到目标 ${otherNode.name}`);
        }
    }
    
    /**
     * 检查是否为有效攻击目标
     */
    private isValidTarget(target: Node): boolean {
        if (this.targetTags.length === 0) {
            return true; // 如果没有指定标签，攻击所有目标
        }
        
        // 检查目标标签
        return this.targetTags.some(tag => target.name.includes(tag));
    }
}

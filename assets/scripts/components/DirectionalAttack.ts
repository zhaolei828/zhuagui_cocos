import { _decorator, Component, Node, Vec3, UITransform, Sprite, Color, Graphics } from 'cc';
import { CombatComponent } from './CombatComponent';
import { HealthComponent } from './HealthComponent';

const { ccclass, property } = _decorator;

/**
 * 方向性攻击组件 - 提供更直观的攻击体验
 */
@ccclass('DirectionalAttack')
export class DirectionalAttack extends Component {
    
    @property({ tooltip: "攻击指示器大小" })
    indicatorSize: number = 100;
    
    @property({ tooltip: "攻击角度范围(度)" })
    attackAngle: number = 60;
    
    @property({ tooltip: "显示攻击范围" })
    showAttackRange: boolean = true;
    
    private combatComponent: CombatComponent = null!;
    private attackDirection: Vec3 = new Vec3(1, 0, 0); // 默认向右
    private attackRangeIndicator: Node = null!;
    private isCharging: boolean = false;
    
    start() {
        this.combatComponent = this.getComponent(CombatComponent);
        this.createAttackRangeIndicator();
    }
    
    update(deltaTime: number) {
        if (this.attackRangeIndicator && this.showAttackRange) {
            this.updateAttackRangeIndicator();
        }
    }
    
    /**
     * 创建攻击范围指示器
     */
    private createAttackRangeIndicator(): void {
        this.attackRangeIndicator = new Node('AttackRangeIndicator');
        this.node.addChild(this.attackRangeIndicator);
        
        // 添加图形组件绘制攻击扇形
        const graphics = this.attackRangeIndicator.addComponent(Graphics);
        this.attackRangeIndicator.addComponent(UITransform);
        
        // 设置为半透明
        graphics.fillColor = new Color(255, 100, 100, 100); // 红色半透明
        graphics.strokeColor = new Color(255, 0, 0, 150);
        graphics.lineWidth = 2;
        
        this.attackRangeIndicator.active = false; // 默认隐藏
    }
    
    /**
     * 从外部触发攻击（由GameManager调用）
     */
    public triggerAttack(): void {
        this.executeDirectionalAttack();
    }
    
    /**
     * 更新攻击方向（由移动控制调用）
     */
    public updateAttackDirection(direction: Vec3): void {
        this.attackDirection = direction.clone().normalize();
    }
    
    /**
     * 显示攻击预览
     */
    public showAttackPreview(): void {
        if (!this.combatComponent || !this.combatComponent.canAttack) {
            return;
        }
        
        this.showAttackRangeIndicator(true);
    }
    
    /**
     * 隐藏攻击预览
     */
    public hideAttackPreview(): void {
        this.showAttackRangeIndicator(false);
    }
    
    /**
     * 执行方向性攻击
     */
    private executeDirectionalAttack(): void {
        if (!this.combatComponent || !this.combatComponent.canAttack) {
            console.log('❌ 攻击冷却中或战斗组件缺失');
            return;
        }
        
        this.hideAttackPreview();
        
        console.log(`⚔️ 执行方向性攻击，方向: (${this.attackDirection.x.toFixed(1)}, ${this.attackDirection.y.toFixed(1)})`);
        
        // 查找攻击范围内的敌人
        const targets = this.findTargetsInDirection();
        console.log(`🎯 找到 ${targets.length} 个目标`);
        
        if (targets.length > 0) {
            // 攻击最近的目标
            const nearestTarget = this.findNearestTarget(targets);
            console.log(`🎯 攻击最近目标: ${nearestTarget.name}`);
            this.combatComponent.attack(nearestTarget);
            
            // 播放攻击特效
            this.playAttackEffect(nearestTarget);
        } else {
            console.log('❌ 攻击范围内没有目标');
            // 播放空挥动画
            this.playMissEffect();
        }
    }
    
    
    /**
     * 查找指定方向的目标
     */
    private findTargetsInDirection(): Node[] {
        const targets: Node[] = [];
        const playerPos = this.node.getPosition();
        const attackRange = this.combatComponent.attackRange;
        const halfAngle = this.attackAngle * Math.PI / 180 / 2; // 转换为弧度
        
        // 搜索所有敌人节点
        const scene = this.node.scene;
        this.searchEnemiesInNode(scene, (enemy) => {
            const enemyPos = enemy.getPosition();
            const toEnemy = enemyPos.subtract(playerPos);
            const distance = toEnemy.length();
            
            // 检查距离
            if (distance > attackRange) return;
            
            // 检查角度
            const enemyDirection = toEnemy.normalize();
            const dot = this.attackDirection.dot(enemyDirection);
            const angle = Math.acos(dot);
            
            if (angle <= halfAngle) {
                targets.push(enemy);
            }
        });
        
        return targets;
    }
    
    /**
     * 递归搜索敌人节点
     */
    private searchEnemiesInNode(node: Node, callback: (enemy: Node) => void): void {
        if (node.name.includes('Enemy') && node !== this.node) {
            callback(node);
        }
        
        for (const child of node.children) {
            this.searchEnemiesInNode(child, callback);
        }
    }
    
    /**
     * 找到最近的目标
     */
    private findNearestTarget(targets: Node[]): Node {
        const playerPos = this.node.getPosition();
        let nearest = targets[0];
        let minDistance = playerPos.subtract(nearest.getPosition()).length();
        
        for (let i = 1; i < targets.length; i++) {
            const distance = playerPos.subtract(targets[i].getPosition()).length();
            if (distance < minDistance) {
                minDistance = distance;
                nearest = targets[i];
            }
        }
        
        return nearest;
    }
    
    /**
     * 显示/隐藏攻击范围指示器
     */
    private showAttackRangeIndicator(show: boolean): void {
        if (this.attackRangeIndicator) {
            this.attackRangeIndicator.active = show;
        }
    }
    
    /**
     * 更新攻击范围指示器
     */
    private updateAttackRangeIndicator(): void {
        if (!this.attackRangeIndicator || !this.attackRangeIndicator.active) return;
        
        const graphics = this.attackRangeIndicator.getComponent(Graphics);
        if (!graphics) return;
        
        graphics.clear();
        
        const range = this.combatComponent.attackRange;
        const halfAngle = this.attackAngle * Math.PI / 180 / 2;
        
        // 计算扇形起始和结束角度
        const directionAngle = Math.atan2(this.attackDirection.y, this.attackDirection.x);
        const startAngle = directionAngle - halfAngle;
        const endAngle = directionAngle + halfAngle;
        
        // 绘制攻击扇形
        graphics.moveTo(0, 0);
        graphics.arc(0, 0, range, startAngle, endAngle);
        graphics.lineTo(0, 0);
        graphics.fill();
        graphics.stroke();
    }
    
    /**
     * 播放攻击命中特效
     */
    private playAttackEffect(target: Node): void {
        console.log(`✨ 攻击命中 ${target.name}！`);
        
        // TODO: 添加粒子特效、屏幕震动等
        // 可以在这里添加更丰富的特效
    }
    
    /**
     * 播放攻击未命中特效
     */
    private playMissEffect(): void {
        console.log('💨 攻击落空');
        
        // TODO: 添加空挥动画
    }
    
}

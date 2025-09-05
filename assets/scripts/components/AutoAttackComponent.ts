import { _decorator, Component, Node, Vec3, input, Input, EventMouse, PhysicsSystem2D, Collider2D, EPhysics2DDrawFlags } from 'cc';
import { CombatComponent } from './CombatComponent';
import { HealthComponent } from './HealthComponent';

const { ccclass, property } = _decorator;

/**
 * 自动攻击组件 - 实现智能攻击逻辑
 * 1. 默认攻击最近的敌人
 * 2. 鼠标悬停的敌人有优先级
 * 3. 持续自动攻击
 */
@ccclass('AutoAttackComponent')
export class AutoAttackComponent extends Component {
    
    @property({ tooltip: "自动攻击开关" })
    enableAutoAttack: boolean = true;
    
    @property({ tooltip: "攻击范围" })
    attackRange: number = 150;
    
    @property({ tooltip: "攻击间隔(秒)" })
    attackInterval: number = 1.0;
    
    @property({ tooltip: "敌人标签" })
    enemyTag: string = "Enemy";
    
    @property({ tooltip: "鼠标目标优先级权重" })
    mouseTargetPriority: number = 2.0;
    
    // 私有属性
    private combatComponent: CombatComponent = null!;
    private healthComponent: HealthComponent = null!;
    private lastAttackTime: number = 0;
    private currentMouseTarget: Node | null = null;
    private currentTarget: Node | null = null;
    
    // 攻击逻辑状态
    private autoAttackTimer: number = 0;
    
    onLoad() {
        // 获取必要的组件
        this.combatComponent = this.getComponent(CombatComponent);
        this.healthComponent = this.getComponent(HealthComponent);
        
        if (!this.combatComponent) {
            console.error('❌ AutoAttackComponent 需要 CombatComponent 组件');
            return;
        }
        
        console.log('🤖 AutoAttackComponent 已加载');
    }
    
    start() {
        // 设置鼠标事件监听
        this.setupMouseEvents();
        console.log('⚔️ 自动攻击系统启动');
    }
    
    update(deltaTime: number) {
        if (!this.enableAutoAttack || !this.canAutoAttack()) {
            return;
        }
        
        // 更新自动攻击计时器
        this.autoAttackTimer += deltaTime;
        
        // 检查是否应该攻击
        if (this.autoAttackTimer >= this.attackInterval) {
            this.executeAutoAttack();
            this.autoAttackTimer = 0;
        }
    }
    
    /**
     * 检查是否可以自动攻击
     */
    private canAutoAttack(): boolean {
        // 检查玩家是否存活
        if (this.healthComponent && this.healthComponent.isDead) {
            return false;
        }
        
        // 检查战斗组件是否可以攻击
        if (!this.combatComponent || !this.combatComponent.canAttack) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 执行自动攻击
     */
    private executeAutoAttack(): void {
        // 1. 优先攻击鼠标悬停的目标
        if (this.currentMouseTarget && this.isValidTarget(this.currentMouseTarget)) {
            console.log(`🎯 攻击鼠标目标: ${this.currentMouseTarget.name}`);
            this.attackTarget(this.currentMouseTarget);
            return;
        }
        
        // 2. 攻击最近的敌人
        const nearestEnemy = this.findNearestEnemy();
        if (nearestEnemy) {
            console.log(`🎯 攻击最近敌人: ${nearestEnemy.name}`);
            this.attackTarget(nearestEnemy);
            return;
        }
        
        // console.log('❌ 没有找到攻击目标');
    }
    
    /**
     * 攻击指定目标
     */
    private attackTarget(target: Node): void {
        if (!target || !this.combatComponent) {
            return;
        }
        
        this.currentTarget = target;
        
        // 调用战斗组件的攻击方法
        const success = this.combatComponent.attack(target);
        
        if (success) {
            console.log(`⚔️ 成功攻击: ${target.name}`);
            this.lastAttackTime = Date.now();
        }
    }
    
    /**
     * 查找最近的敌人
     */
    private findNearestEnemy(): Node | null {
        const playerPos = this.node.getPosition();
        let nearestEnemy: Node | null = null;
        let minDistance = this.attackRange;
        
        // 遍历所有子节点，查找敌人
        const scene = this.node.scene;
        if (!scene) return null;
        
        this.findEnemiesInNode(scene, playerPos, (enemy, distance) => {
            if (distance < minDistance && this.isValidTarget(enemy)) {
                nearestEnemy = enemy;
                minDistance = distance;
            }
        });
        
        return nearestEnemy;
    }
    
    /**
     * 递归查找场景中的敌人节点
     */
    private findEnemiesInNode(node: Node, playerPos: Vec3, callback: (enemy: Node, distance: number) => void): void {
        // 检查当前节点是否是敌人
        if (this.isEnemyNode(node)) {
            const distance = node.getPosition().subtract(playerPos).length();
            callback(node, distance);
        }
        
        // 递归检查子节点
        for (const child of node.children) {
            this.findEnemiesInNode(child, playerPos, callback);
        }
    }
    
    /**
     * 判断节点是否是敌人
     */
    private isEnemyNode(node: Node): boolean {
        // 检查节点名称是否包含敌人标识
        if (node.name.includes('Enemy') || node.name.includes('enemy')) {
            return true;
        }
        
        // 检查节点是否有 HealthComponent 和 EnemyAI
        const hasHealth = node.getComponent(HealthComponent) !== null;
        const hasEnemyAI = node.getComponent('EnemyAI') !== null;
        
        return hasHealth && hasEnemyAI;
    }
    
    /**
     * 验证目标是否有效
     */
    private isValidTarget(target: Node): boolean {
        if (!target) return false;
        
        // 检查目标是否存活
        const targetHealth = target.getComponent(HealthComponent);
        if (targetHealth && targetHealth.isDead) {
            return false;
        }
        
        // 检查距离
        const distance = this.node.getPosition().subtract(target.getPosition()).length();
        if (distance > this.attackRange) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 设置鼠标事件监听
     */
    private setupMouseEvents(): void {
        // 监听鼠标移动事件
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        
        console.log('🖱️ 鼠标事件监听已设置');
    }
    
    /**
     * 鼠标移动事件处理
     */
    private onMouseMove(event: EventMouse): void {
        // 将屏幕坐标转换为世界坐标
        const worldPos = this.screenToWorld(event.getLocationX(), event.getLocationY());
        if (!worldPos) return;
        
        // 查找鼠标位置的敌人
        const mouseTarget = this.findEnemyAtPosition(worldPos);
        
        if (mouseTarget !== this.currentMouseTarget) {
            this.currentMouseTarget = mouseTarget;
            
            if (mouseTarget) {
                console.log(`🖱️ 鼠标悬停在敌人: ${mouseTarget.name}`);
                this.highlightTarget(mouseTarget);
            } else {
                this.clearHighlight();
            }
        }
    }
    
    /**
     * 鼠标离开事件处理
     */
    private onMouseLeave(event: EventMouse): void {
        this.currentMouseTarget = null;
        this.clearHighlight();
    }
    
    /**
     * 屏幕坐标转世界坐标
     */
    private screenToWorld(screenX: number, screenY: number): Vec3 | null {
        try {
            // 获取摄像机
            const camera = this.node.scene?.getComponentInChildren('Camera');
            if (!camera) return null;
            
            // 这里需要根据实际的摄像机组件进行坐标转换
            // 暂时使用简化的转换逻辑
            return new Vec3(screenX - 640, 360 - screenY, 0);
        } catch (error) {
            return null;
        }
    }
    
    /**
     * 查找指定位置的敌人
     */
    private findEnemyAtPosition(worldPos: Vec3): Node | null {
        const scene = this.node.scene;
        if (!scene) return null;
        
        let foundEnemy: Node | null = null;
        const searchRadius = 50; // 鼠标检测半径
        
        this.findEnemiesInNode(scene, worldPos, (enemy, distance) => {
            if (distance <= searchRadius && this.isValidTarget(enemy)) {
                foundEnemy = enemy;
            }
        });
        
        return foundEnemy;
    }
    
    /**
     * 高亮目标（可选实现）
     */
    private highlightTarget(target: Node): void {
        // TODO: 添加视觉高亮效果
        // 比如改变颜色、添加光圈等
        console.log(`✨ 高亮目标: ${target.name}`);
    }
    
    /**
     * 清除高亮
     */
    private clearHighlight(): void {
        // TODO: 清除视觉高亮效果
        // console.log('🔄 清除高亮');
    }
    
    /**
     * 手动设置攻击目标（供外部调用）
     */
    public setManualTarget(target: Node | null): void {
        this.currentMouseTarget = target;
        if (target) {
            console.log(`🎯 手动设置攻击目标: ${target.name}`);
        }
    }
    
    /**
     * 开启/关闭自动攻击
     */
    public setAutoAttack(enable: boolean): void {
        this.enableAutoAttack = enable;
        console.log(`⚔️ 自动攻击: ${enable ? '开启' : '关闭'}`);
    }
    
    /**
     * 获取当前目标
     */
    public getCurrentTarget(): Node | null {
        return this.currentTarget;
    }
    
    onDestroy() {
        // 清理事件监听
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }
}

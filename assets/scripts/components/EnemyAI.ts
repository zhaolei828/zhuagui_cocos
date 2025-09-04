import { _decorator, Component, Node, Vec3 } from 'cc';
import { HealthComponent } from './HealthComponent';
import { CombatComponent } from './CombatComponent';

const { ccclass, property } = _decorator;

/**
 * 敌人AI状态
 */
enum AIState {
    IDLE = 'idle',
    PATROL = 'patrol', 
    CHASE = 'chase',
    ATTACK = 'attack',
    DEAD = 'dead'
}

/**
 * 敌人AI组件 - 处理敌人的智能行为
 */
@ccclass('EnemyAI')
export class EnemyAI extends Component {
    
    @property({ tooltip: "移动速度" })
    moveSpeed: number = 100;
    
    @property({ tooltip: "巡逻范围" })
    patrolRange: number = 100;
    
    @property({ tooltip: "视野范围" })
    sightRange: number = 150;
    
    @property({ tooltip: "攻击范围" })
    attackRange: number = 60;
    
    @property({ tooltip: "巡逻等待时间" })
    patrolWaitTime: number = 2.0;
    
    @property({ tooltip: "失去目标后的追击时间" })
    chaseTime: number = 3.0;
    
    @property({ tooltip: "玩家节点引用", type: Node })
    player: Node = null!;
    
    // AI状态
    private currentState: AIState = AIState.IDLE;
    private target: Node = null!;
    private originalPosition: Vec3 = new Vec3();
    private patrolTarget: Vec3 = new Vec3();
    private stateTimer: number = 0;
    private lastPlayerPosition: Vec3 = new Vec3();
    
    // 组件引用
    private healthComponent: HealthComponent = null!;
    private combatComponent: CombatComponent = null!;
    
    start() {
        this.healthComponent = this.getComponent(HealthComponent);
        this.combatComponent = this.getComponent(CombatComponent);
        
        // 保存初始位置
        this.originalPosition = this.node.getPosition().clone();
        
        // 设置死亡回调
        if (this.healthComponent) {
            this.healthComponent.onDeath = this.onDeath.bind(this);
        }
        
        // 动态查找玩家
        if (!this.player) {
            this.player = this.findPlayerNode();
            if (!this.player) {
                console.error(`❌ AI 无法找到玩家节点`);
            }
        }
        
        // 开始巡逻
        this.setState(AIState.PATROL);
        this.generatePatrolTarget();
    }
    
    update(deltaTime: number) {
        if (!this.healthComponent || this.healthComponent.isDead) {
            return;
        }
        
        // 如果没有玩家，保持待机
        if (!this.player) {
            this.setState(AIState.IDLE);
            return;
        }
        
        this.stateTimer += deltaTime;
        
        // 更新AI状态
        this.updateAI(deltaTime);
        
        // 检测玩家
        this.detectPlayer();
        
        // 执行当前状态行为
        this.executeCurrentState(deltaTime);
    }
    
    /**
     * 更新AI状态机
     */
    private updateAI(deltaTime: number): void {
        switch (this.currentState) {
            case AIState.PATROL:
                this.updatePatrolState();
                break;
            case AIState.CHASE:
                this.updateChaseState();
                break;
            case AIState.ATTACK:
                this.updateAttackState();
                break;
        }
    }
    
    /**
     * 检测玩家
     */
    private detectPlayer(): void {
        if (!this.player || this.currentState === AIState.DEAD) {
            return;
        }
        
        const distance = this.getDistanceToPlayer();
        
        // 在视野范围内发现玩家
        if (distance <= this.sightRange && this.currentState !== AIState.CHASE && this.currentState !== AIState.ATTACK) {
            this.target = this.player;
            this.setState(AIState.CHASE);
        }
        
        // 进入攻击范围
        if (distance <= this.attackRange && this.target === this.player) {
            this.setState(AIState.ATTACK);
        }
        
        // 离开攻击范围但在视野内
        if (distance > this.attackRange && distance <= this.sightRange && this.currentState === AIState.ATTACK) {
            this.setState(AIState.CHASE);
        }
        
        // 完全失去目标
        if (distance > this.sightRange && this.target === this.player) {
            this.lastPlayerPosition = this.player.getPosition().clone();
            this.setState(AIState.CHASE); // 先去最后看到的位置
        }
    }
    
    /**
     * 执行当前状态的行为
     */
    private executeCurrentState(deltaTime: number): void {
        switch (this.currentState) {
            case AIState.PATROL:
                this.patrolBehavior(deltaTime);
                break;
            case AIState.CHASE:
                this.chaseBehavior(deltaTime);
                break;
            case AIState.ATTACK:
                this.attackBehavior(deltaTime);
                break;
        }
    }
    
    /**
     * 巡逻行为
     */
    private patrolBehavior(deltaTime: number): void {
        const currentPos = this.node.getPosition();
        const distanceToTarget = currentPos.subtract(this.patrolTarget).length();
        
        if (distanceToTarget < 10) {
            // 到达巡逻点，等待一段时间后选择新目标
            if (this.stateTimer >= this.patrolWaitTime) {
                this.generatePatrolTarget();
                this.stateTimer = 0;
            }
        } else {
            // 向巡逻目标移动
            this.moveTowards(this.patrolTarget, deltaTime);
        }
    }
    
    /**
     * 追击行为
     */
    private chaseBehavior(deltaTime: number): void {
        if (this.target === this.player) {
            // 直接追击玩家
            this.moveTowards(this.target.getPosition(), deltaTime);
        } else {
            // 追击到最后看到的位置
            const distanceToLastPos = this.node.getPosition().subtract(this.lastPlayerPosition).length();
            if (distanceToLastPos < 20 || this.stateTimer >= this.chaseTime) {
                // 到达位置或超时，返回巡逻
                this.target = null!;
                this.setState(AIState.PATROL);
                this.generatePatrolTarget();
            } else {
                this.moveTowards(this.lastPlayerPosition, deltaTime);
            }
        }
    }
    
    /**
     * 攻击行为
     */
    private attackBehavior(deltaTime: number): void {
        if (this.combatComponent && this.combatComponent.canAttack) {
            if (this.target && this.target === this.player) {
                this.combatComponent.attack(this.target);
            }
        }
        
        // 面向目标
        if (this.target) {
            this.faceTarget(this.target.getPosition());
        }
    }
    
    /**
     * 向目标位置移动
     */
    private moveTowards(targetPos: Vec3, deltaTime: number): void {
        const currentPos = this.node.getPosition();
        const direction = targetPos.subtract(currentPos).normalize();
        const moveDistance = this.moveSpeed * deltaTime;
        
        const newPos = currentPos.add(direction.multiplyScalar(moveDistance));
        this.node.setPosition(newPos);
        
        // 面向移动方向
        this.faceTarget(targetPos);
    }
    
    /**
     * 面向目标
     */
    private faceTarget(targetPos: Vec3): void {
        // 这里可以添加旋转逻辑
        // 由于是2D游戏，可能不需要旋转，或者只是改变sprite的朝向
    }
    
    /**
     * 生成巡逻目标点
     */
    private generatePatrolTarget(): void {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.patrolRange;
        
        this.patrolTarget = this.originalPosition.clone().add(new Vec3(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            0
        ));
    }
    
    /**
     * 获取到玩家的距离
     */
    private getDistanceToPlayer(): number {
        if (!this.player) return Infinity;
        return this.node.getPosition().subtract(this.player.getPosition()).length();
    }
    
    /**
     * 更新巡逻状态
     */
    private updatePatrolState(): void {
        // 巡逻状态的额外逻辑
    }
    
    /**
     * 更新追击状态
     */
    private updateChaseState(): void {
        // 检查是否需要更新追击目标
        if (this.target === this.player && this.getDistanceToPlayer() > this.sightRange) {
            // 玩家离开视野，记录最后位置
            this.lastPlayerPosition = this.player.getPosition().clone();
            this.target = null!;
        }
    }
    
    /**
     * 更新攻击状态
     */
    private updateAttackState(): void {
        // 检查是否还在攻击范围内
        if (this.getDistanceToPlayer() > this.attackRange) {
            this.setState(AIState.CHASE);
        }
    }
    
    /**
     * 设置AI状态
     */
    private setState(newState: AIState): void {
        if (this.currentState === newState) return;
        
        this.currentState = newState;
        this.stateTimer = 0;
    }
    
    /**
     * 死亡处理
     */
    private onDeath(): void {
        this.setState(AIState.DEAD);
        console.log(`💀 ${this.node.name} 敌人死亡`);
        
        // 可以在这里添加死亡动画或掉落道具
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 2.0); // 2秒后销毁
    }

    /**
     * 查找玩家节点
     */
    private findPlayerNode(): Node | null {
        const scene = this.node.scene;
        
        // 方法1: 尝试硬编码路径 Canvas/GameRoot/Player
        const canvas = scene.getChildByName('Canvas');
        if (canvas) {
            const gameRoot = canvas.getChildByName('GameRoot');
            if (gameRoot) {
                const player = gameRoot.getChildByName('Player');
                if (player) {
                    return player;
                }
            }
        }
        
        // 方法2: 递归查找玩家节点
        const searchNode = (node: Node): Node | null => {
            if (node.name === 'Player' || node.name.includes('Player') || node.name === 'player') {
                return node;
            }
            for (const child of node.children) {
                const found = searchNode(child);
                if (found) return found;
            }
            return null;
        };
        
        return searchNode(scene);
    }
}

import { _decorator, Component, Node, Sprite, Color, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 动画类型
 */
enum AnimationType {
    IDLE = 'idle',
    MOVE = 'move',
    ATTACK = 'attack',
    HURT = 'hurt',
    DEATH = 'death',
    INTERACTION = 'interaction'
}

/**
 * 动画组件 - 处理各种动画效果
 */
@ccclass('AnimationComponent')
export class AnimationComponent extends Component {
    
    @property({ tooltip: "动画播放速度倍率" })
    animationSpeed: number = 1.0;
    
    @property({ tooltip: "是否启用动画" })
    enableAnimation: boolean = true;
    
    private sprite: Sprite = null!;
    private originalColor: Color = new Color();
    private originalScale: Vec3 = new Vec3();
    private currentAnimation: AnimationType = AnimationType.IDLE;
    private animationTween: any = null;
    
    start() {
        this.sprite = this.getComponent(Sprite);
        if (this.sprite) {
            this.originalColor = this.sprite.color.clone();
        }
        this.originalScale = this.node.getScale().clone();
    }
    
    /**
     * 播放动画
     */
    playAnimation(type: AnimationType, loop: boolean = false): void {
        if (!this.enableAnimation) return;
        
        // 停止当前动画
        this.stopCurrentAnimation();
        
        this.currentAnimation = type;
        
        switch (type) {
            case AnimationType.IDLE:
                this.playIdleAnimation(loop);
                break;
            case AnimationType.MOVE:
                this.playMoveAnimation(loop);
                break;
            case AnimationType.ATTACK:
                this.playAttackAnimation();
                break;
            case AnimationType.HURT:
                this.playHurtAnimation();
                break;
            case AnimationType.DEATH:
                this.playDeathAnimation();
                break;
            case AnimationType.INTERACTION:
                this.playInteractionAnimation();
                break;
        }
    }
    
    /**
     * 待机动画 - 轻微的上下浮动
     */
    private playIdleAnimation(loop: boolean): void {
        const duration = 2.0 / this.animationSpeed;
        
        this.animationTween = tween(this.node)
            .to(duration / 2, { position: this.node.getPosition().add(new Vec3(0, 5, 0)) })
            .to(duration / 2, { position: this.node.getPosition() })
            .call(() => {
                if (loop && this.currentAnimation === AnimationType.IDLE) {
                    this.playIdleAnimation(true);
                }
            })
            .start();
    }
    
    /**
     * 移动动画 - 左右摇摆
     */
    private playMoveAnimation(loop: boolean): void {
        const duration = 0.3 / this.animationSpeed;
        const scale = this.originalScale.clone();
        
        this.animationTween = tween(this.node)
            .to(duration / 2, { scale: new Vec3(scale.x * 1.1, scale.y * 0.9, scale.z) })
            .to(duration / 2, { scale: scale })
            .call(() => {
                if (loop && this.currentAnimation === AnimationType.MOVE) {
                    this.playMoveAnimation(true);
                }
            })
            .start();
    }
    
    /**
     * 攻击动画 - 快速放大缩小
     */
    private playAttackAnimation(): void {
        const duration = 0.2 / this.animationSpeed;
        const scale = this.originalScale.clone();
        
        this.animationTween = tween(this.node)
            .to(duration / 3, { scale: new Vec3(scale.x * 1.3, scale.y * 1.3, scale.z) })
            .to(duration / 3, { scale: new Vec3(scale.x * 0.8, scale.y * 0.8, scale.z) })
            .to(duration / 3, { scale: scale })
            .call(() => {
                this.currentAnimation = AnimationType.IDLE;
            })
            .start();
    }
    
    /**
     * 受伤动画 - 红色闪烁
     */
    private playHurtAnimation(): void {
        if (!this.sprite) return;
        
        const duration = 0.1 / this.animationSpeed;
        const hurtColor = Color.RED;
        
        this.animationTween = tween(this.sprite)
            .to(duration, { color: hurtColor })
            .to(duration, { color: this.originalColor })
            .to(duration, { color: hurtColor })
            .to(duration, { color: this.originalColor })
            .call(() => {
                this.currentAnimation = AnimationType.IDLE;
            })
            .start();
    }
    
    /**
     * 死亡动画 - 淡出并缩小
     */
    private playDeathAnimation(): void {
        const duration = 1.0 / this.animationSpeed;
        
        if (this.sprite) {
            tween(this.sprite)
                .to(duration, { color: new Color(255, 255, 255, 0) })
                .start();
        }
        
        this.animationTween = tween(this.node)
            .to(duration, { 
                scale: new Vec3(0, 0, 0),
                angle: 180
            })
            .call(() => {
                console.log(`💀 ${this.node.name} 死亡动画完成`);
            })
            .start();
    }
    
    /**
     * 交互动画 - 跳跃效果
     */
    private playInteractionAnimation(): void {
        const duration = 0.5 / this.animationSpeed;
        const jumpHeight = 20;
        const originalPos = this.node.getPosition();
        
        this.animationTween = tween(this.node)
            .to(duration / 2, { position: originalPos.add(new Vec3(0, jumpHeight, 0)) })
            .to(duration / 2, { position: originalPos })
            .call(() => {
                this.currentAnimation = AnimationType.IDLE;
            })
            .start();
    }
    
    /**
     * 播放伤害数字动画
     */
    playDamageNumber(damage: number, color: Color = Color.RED): void {
        // 创建伤害数字节点
        const damageNode = new Node('DamageNumber');
        damageNode.setParent(this.node.parent);
        damageNode.setPosition(this.node.getPosition().add(new Vec3(0, 30, 0)));
        
        // 这里可以添加Label组件来显示伤害数字
        // 由于当前没有UI系统，暂时用控制台输出代替
        console.log(`💥 伤害: ${damage}`);
        
        // 伤害数字上升并淡出
        tween(damageNode)
            .to(1.0, { 
                position: damageNode.getPosition().add(new Vec3(0, 50, 0))
            })
            .call(() => {
                damageNode.destroy();
            })
            .start();
    }
    
    /**
     * 播放治疗效果
     */
    playHealEffect(): void {
        if (!this.sprite) return;
        
        const duration = 0.5 / this.animationSpeed;
        const healColor = Color.GREEN;
        
        tween(this.sprite)
            .to(duration / 4, { color: healColor })
            .to(duration / 4, { color: this.originalColor })
            .to(duration / 4, { color: healColor })
            .to(duration / 4, { color: this.originalColor })
            .start();
    }
    
    /**
     * 播放闪烁效果
     */
    playBlinkEffect(duration: number = 1.0, interval: number = 0.1): void {
        if (!this.sprite) return;
        
        const blinkTween = tween(this.sprite)
            .to(interval, { color: new Color(255, 255, 255, 100) })
            .to(interval, { color: this.originalColor });
        
        const repeatCount = Math.floor(duration / (interval * 2));
        for (let i = 0; i < repeatCount; i++) {
            blinkTween.union();
        }
        
        blinkTween
            .call(() => {
                this.sprite.color = this.originalColor;
            })
            .start();
    }
    
    /**
     * 播放震动效果
     */
    playShakeEffect(intensity: number = 5, duration: number = 0.3): void {
        const originalPos = this.node.getPosition();
        const shakeCount = 10;
        const intervalTime = duration / shakeCount;
        
        let shakeTween = tween(this.node);
        
        for (let i = 0; i < shakeCount; i++) {
            const randomX = (Math.random() - 0.5) * intensity * 2;
            const randomY = (Math.random() - 0.5) * intensity * 2;
            const shakePos = originalPos.clone().add(new Vec3(randomX, randomY, 0));
            
            shakeTween = shakeTween.to(intervalTime, { position: shakePos });
        }
        
        shakeTween
            .to(intervalTime, { position: originalPos })
            .start();
    }
    
    /**
     * 停止当前动画
     */
    stopCurrentAnimation(): void {
        if (this.animationTween) {
            this.animationTween.stop();
            this.animationTween = null;
        }
    }
    
    /**
     * 重置到初始状态
     */
    resetToOriginal(): void {
        this.stopCurrentAnimation();
        
        if (this.sprite) {
            this.sprite.color = this.originalColor;
        }
        
        this.node.setScale(this.originalScale);
        this.currentAnimation = AnimationType.IDLE;
    }
    
    /**
     * 获取当前动画状态
     */
    getCurrentAnimation(): AnimationType {
        return this.currentAnimation;
    }
    
    /**
     * 设置动画速度
     */
    setAnimationSpeed(speed: number): void {
        this.animationSpeed = Math.max(0.1, speed);
    }
}

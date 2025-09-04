import { _decorator, Component, Node, Label, UITransform, tween, Vec3, Color } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 伤害数字组件 - 显示漂浮的伤害数字
 */
@ccclass('DamageNumber')
export class DamageNumber extends Component {
    
    @property({ tooltip: "漂浮高度" })
    floatHeight: number = 80;
    
    @property({ tooltip: "漂浮时间" })
    floatTime: number = 1.0;
    
    @property({ tooltip: "侧向漂移" })
    sideOffset: number = 30;
    
    private label: Label = null!;

    onLoad() {
        this.initializeLabel();
    }
    
    /**
     * 初始化Label组件
     */
    public initializeLabel(): void {
        // 确保有UITransform
        if (!this.getComponent(UITransform)) {
            this.addComponent(UITransform);
        }
        
        // 创建Label组件
        this.label = this.getComponent(Label);
        if (!this.label) {
            this.label = this.addComponent(Label);
        }
        
        // 设置默认样式
        this.label.fontSize = 24;
        this.label.color = new Color(255, 255, 255, 255);
        this.label.string = "0";
        
        console.log('✅ DamageNumber初始化完成');
    }
    
    /**
     * 显示伤害数字
     */
    public showDamage(damage: number, damageType: 'normal' | 'critical' | 'heal' = 'normal'): void {
        // 确保Label存在
        if (!this.label) {
            this.initializeLabel();
        }
        
        // 再次检查
        if (!this.label) {
            console.error('❌ DamageNumber: Label组件仍为null');
            return;
        }
        
        // 设置伤害文本
        this.label.string = damage.toString();
        
        // 设置样式
        switch (damageType) {
            case 'critical':
                this.label.color = new Color(255, 100, 100, 255); // 红色
                this.label.fontSize = 32;
                this.label.string = `${damage}!`;
                break;
            case 'heal':
                this.label.color = new Color(100, 255, 100, 255); // 绿色
                this.label.fontSize = 28;
                this.label.string = `+${damage}`;
                break;
            default:
                this.label.color = new Color(255, 255, 100, 255); // 黄色
                this.label.fontSize = 24;
                break;
        }
        
        // 播放漂浮动画
        this.playFloatAnimation();
    }
    
    /**
     * 播放漂浮动画
     */
    private playFloatAnimation(): void {
        const startPos = this.node.getPosition();
        const sideDir = (Math.random() - 0.5) * 2;
        const endPos = new Vec3(
            startPos.x + sideDir * this.sideOffset,
            startPos.y + this.floatHeight, // 🔧 向上漂浮（Y轴正值）
            startPos.z
        );
        
        // 位置动画
        tween(this.node)
            .to(this.floatTime, { position: endPos }, { easing: 'quadOut' })
            .start();
        
        // 透明度动画
        tween(this.label)
            .delay(this.floatTime * 0.6)
            .to(this.floatTime * 0.4, { 
                color: new Color(
                    this.label.color.r,
                    this.label.color.g,
                    this.label.color.b,
                    0
                )
            })
            .call(() => {
                this.node.destroy();
            })
            .start();
        
        // 缩放动画
        this.node.setScale(0.8, 0.8, 1);
        tween(this.node)
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backOut' })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }
    
    /**
     * 创建伤害数字节点
     */
    public static createDamageNumber(parent: Node, damage: number, damageType: 'normal' | 'critical' | 'heal' = 'normal'): Node {
        const damageNode = new Node('DamageNumber');
        parent.addChild(damageNode);
        
        // 随机位置偏移
        const offset = new Vec3(
            (Math.random() - 0.5) * 40,
            Math.random() * 20,
            0
        );
        damageNode.setPosition(offset);
        
        const damageNumber = damageNode.addComponent(DamageNumber);
        // 立即初始化Label，然后显示伤害
        damageNumber.initializeLabel();
        damageNumber.showDamage(damage, damageType);
        
        return damageNode;
    }
}
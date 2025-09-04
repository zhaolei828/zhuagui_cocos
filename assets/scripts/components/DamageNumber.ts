import { _decorator, Component, Node, Label, Vec3, Color, tween, UITransform } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 伤害数字显示组件 - 显示漂浮的伤害数字
 */
@ccclass('DamageNumber')
export class DamageNumber extends Component {
    
    @property({ tooltip: "漂浮时间" })
    floatTime: number = 1.5;
    
    @property({ tooltip: "漂浮高度" })
    floatHeight: number = 80;
    
    @property({ tooltip: "侧向漂移" })
    sideOffset: number = 30;
    
    private label: Label = null!;
    
    onLoad() {
        this.setupLabel();
    }
    
    /**
     * 设置标签组件
     */
    private setupLabel(): void {
        // 确保有UITransform
        if (!this.getComponent(UITransform)) {
            this.addComponent(UITransform);
        }
        
        this.label = this.getComponent(Label);
        if (!this.label) {
            this.label = this.addComponent(Label);
        }
        
        // 设置字体样式
        this.label.fontSize = 24;
        this.label.color = new Color(255, 255, 255, 255);
        this.label.enableOutline = true;
        this.label.outlineColor = new Color(0, 0, 0, 255);
        this.label.outlineWidth = 2;
    }
    
    /**
     * 显示伤害数字
     */
    public showDamage(damage: number, damageType: 'normal' | 'critical' | 'heal' = 'normal'): void {
        // 确保Label组件存在
        if (!this.label) {
            this.setupLabel();
        }
        
        // 设置数字文本
        this.label.string = damage.toString();
        
        // 根据伤害类型设置颜色和大小
        this.setDamageStyle(damageType, damage);
        
        // 播放漂浮动画
        this.playFloatAnimation();
    }
    
    /**
     * 设置伤害样式
     */
    private setDamageStyle(damageType: string, damage: number): void {
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
            case 'normal':
            default:
                this.label.color = new Color(255, 255, 100, 255); // 黄色
                this.label.fontSize = 24;
                break;
        }
    }
    
    /**
     * 播放漂浮动画
     */
    private playFloatAnimation(): void {
        const startPos = this.node.getPosition();
        const sideDir = (Math.random() - 0.5) * 2; // -1 到 1
        const endPos = new Vec3(
            startPos.x + sideDir * this.sideOffset,
            startPos.y + this.floatHeight,
            startPos.z
        );
        
        // 位置动画
        tween(this.node)
            .to(this.floatTime, { position: endPos }, {
                easing: 'quadOut'
            })
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
        this.node.setScale(0.5, 0.5, 1);
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
        damageNumber.showDamage(damage, damageType);
        
        return damageNode;
    }
}

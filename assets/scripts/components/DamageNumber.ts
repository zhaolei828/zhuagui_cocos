import { _decorator, Component, Node, Label, UITransform, tween, Vec3, Color } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 伤害数字组件 - 显示漂浮的伤害数字
 * 彻底重写版本，解决Label初始化问题
 */
@ccclass('DamageNumber')
export class DamageNumber extends Component {
    
    @property({ tooltip: "漂浮高度" })
    floatHeight: number = 80;
    
    @property({ tooltip: "漂浮时间" })
    floatTime: number = 1.0;
    
    @property({ tooltip: "侧向漂移" })
    sideOffset: number = 30;
    
    private label: Label | null = null;

    /**
     * 强制初始化Label组件 - 彻底解决null问题
     */
    private forceInitLabel(): boolean {
        try {
            console.log('🔧 开始强制初始化Label...');
            
            // 清理旧的Label
            if (this.label) {
                console.log('🗑️ 清理旧Label');
                this.label = null;
            }
            
            // 确保UITransform存在
            let uiTransform = this.getComponent(UITransform);
            if (!uiTransform) {
                console.log('➕ 添加UITransform组件');
                uiTransform = this.addComponent(UITransform);
            }
            
            // 移除所有现有的Label组件
            const existingLabels = this.getComponents(Label);
            for (const oldLabel of existingLabels) {
                console.log('🗑️ 移除旧Label组件');
                this.removeComponent(oldLabel);
            }
            
            // 重新创建Label组件
            console.log('🆕 创建新Label组件');
            this.label = this.addComponent(Label);
            
            if (!this.label) {
                console.error('❌ Label创建失败！');
                return false;
            }
            
            // 设置Label属性
            this.label.string = "0";
            this.label.fontSize = 24;
            this.label.color = new Color(255, 255, 255, 255);
            
            console.log('✅ Label初始化成功！');
            return true;
            
        } catch (error) {
            console.error('❌ Label初始化异常:', error);
            return false;
        }
    }
    
    /**
     * 显示伤害数字
     */
    public showDamage(damage: number, damageType: 'normal' | 'critical' | 'heal' = 'normal'): void {
        console.log(`🎯 显示伤害数字: ${damage}`);
        
        // 强制重新初始化Label
        if (!this.forceInitLabel()) {
            console.error('❌ Label初始化失败，无法显示伤害数字');
            return;
        }
        
        // 二次检查Label
        if (!this.label) {
            console.error('❌ Label仍然为null！');
            return;
        }
        
        console.log('🎨 设置伤害数字样式...');
        
        // 设置样式
        try {
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
                    this.label.string = `${damage}`;
                    break;
            }
            
            console.log(`✅ 伤害数字设置完成: ${this.label.string}`);
            
            // 播放动画
            this.playFloatAnimation();
            
        } catch (error) {
            console.error('❌ 设置伤害数字样式时出错:', error);
        }
    }
    
    /**
     * 播放漂浮动画
     */
    private playFloatAnimation(): void {
        console.log('🎬 开始播放漂浮动画...');
        
        const startPos = this.node.getPosition();
        const sideDir = (Math.random() - 0.5) * 2;
        const endPos = new Vec3(
            startPos.x + sideDir * this.sideOffset,
            startPos.y + this.floatHeight, // 向上漂浮
            startPos.z
        );
        
        // 位置动画
        tween(this.node)
            .to(this.floatTime, { position: endPos }, { easing: 'quadOut' })
            .start();
        
        // 透明度动画
        if (this.label) {
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
                    console.log('🗑️ 销毁伤害数字节点');
                    this.node.destroy();
                })
                .start();
        }
        
        // 缩放动画
        this.node.setScale(0.8, 0.8, 1);
        tween(this.node)
            .to(0.2, { scale: new Vec3(1.2, 1.2, 1) }, { easing: 'backOut' })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
            
        console.log('✅ 动画启动完成');
    }
    
    /**
     * 创建伤害数字节点
     */
    public static createDamageNumber(parent: Node, damage: number, damageType: 'normal' | 'critical' | 'heal' = 'normal'): Node {
        console.log(`🆕 创建伤害数字节点: ${damage}`);
        
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
        
        // 立即显示伤害数字
        damageNumber.showDamage(damage, damageType);
        
        return damageNode;
    }
}
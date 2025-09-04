import { _decorator, Component, Node, Label, UITransform, tween, Vec3, Color } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 伤害显示组件 - 全新文件名，强制编译更新
 */
@ccclass('DamageDisplay')
export class DamageDisplay extends Component {
    
    @property({ tooltip: "漂浮高度" })
    floatHeight: number = 80;
    
    @property({ tooltip: "漂浮时间" })
    floatTime: number = 1.0;
    
    @property({ tooltip: "侧向漂移" })
    sideOffset: number = 30;
    
    private label: Label | null = null;

    /**
     * 强制初始化Label组件
     */
    private forceInitLabel(): boolean {
        try {
            console.log('🔧🔧🔧 DamageDisplay强制初始化开始...');
            
            // 移除所有现有Label
            const existingLabels = this.getComponents(Label);
            existingLabels.forEach(oldLabel => {
                console.log('🗑️ 移除旧Label');
                this.removeComponent(oldLabel);
            });
            
            // 确保UITransform
            if (!this.getComponent(UITransform)) {
                console.log('➕ 添加UITransform');
                this.addComponent(UITransform);
            }
            
            // 创建新Label
            console.log('🆕 创建全新Label');
            this.label = this.addComponent(Label);
            
            if (!this.label) {
                console.error('❌❌❌ Label创建失败！');
                return false;
            }
            
            // 初始化属性
            this.label.string = "";
            this.label.fontSize = 24;
            this.label.color = new Color(255, 255, 255, 255);
            
            console.log('✅✅✅ DamageDisplay初始化成功！');
            return true;
            
        } catch (error) {
            console.error('❌❌❌ 初始化异常:', error);
            return false;
        }
    }
    
    /**
     * 显示伤害数字
     */
    public showDamage(damage: number, damageType: 'normal' | 'critical' | 'heal' = 'normal'): void {
        console.log(`🎯🎯🎯 DamageDisplay显示伤害: ${damage}`);
        
        if (!this.forceInitLabel()) {
            console.error('❌❌❌ Label初始化失败');
            return;
        }
        
        if (!this.label) {
            console.error('❌❌❌ Label仍为null！');
            return;
        }
        
        try {
            console.log('🎨 设置样式...');
            
            switch (damageType) {
                case 'critical':
                    this.label.color = new Color(255, 100, 100, 255);
                    this.label.fontSize = 32;
                    this.label.string = `${damage}!`;
                    break;
                case 'heal':
                    this.label.color = new Color(100, 255, 100, 255);
                    this.label.fontSize = 28;
                    this.label.string = `+${damage}`;
                    break;
                default:
                    this.label.color = new Color(255, 255, 100, 255);
                    this.label.fontSize = 24;
                    this.label.string = `${damage}`;
                    break;
            }
            
            console.log(`✅✅✅ 样式设置完成: "${this.label.string}"`);
            this.playFloatAnimation();
            
        } catch (error) {
            console.error('❌❌❌ 设置样式出错:', error);
        }
    }
    
    /**
     * 播放漂浮动画
     */
    private playFloatAnimation(): void {
        console.log('🎬 播放动画...');
        
        const startPos = this.node.getPosition();
        const sideDir = (Math.random() - 0.5) * 2;
        
        // 向上漂浮
        const endPos = new Vec3(
            startPos.x + sideDir * this.sideOffset,
            startPos.y + this.floatHeight, // 正值向上
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
                    console.log('🗑️ 销毁节点');
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
            
        console.log('✅✅✅ 动画启动完成');
    }
    
    /**
     * 创建伤害显示节点
     */
    public static createDamageDisplay(parent: Node, damage: number, damageType: 'normal' | 'critical' | 'heal' = 'normal'): Node {
        console.log(`🆕🆕🆕 创建DamageDisplay节点: ${damage}`);
        
        const damageNode = new Node('DamageDisplay');
        parent.addChild(damageNode);
        
        // 随机偏移
        const offset = new Vec3(
            (Math.random() - 0.5) * 40,
            Math.random() * 20,
            0
        );
        damageNode.setPosition(offset);
        
        const damageDisplay = damageNode.addComponent(DamageDisplay);
        damageDisplay.showDamage(damage, damageType);
        
        return damageNode;
    }
}

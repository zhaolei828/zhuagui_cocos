import { _decorator, Component, Node, Vec3, find } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 视差滚动背景控制器
 * 用于控制多层背景以不同速度移动，营造深度感
 */
@ccclass('ParallaxBackground')
export class ParallaxBackground extends Component {
    @property(Node)
    public player: Node = null!;

    @property([Node])
    public backgroundLayers: Node[] = [];

    @property([Number])
    public layerSpeeds: number[] = [0.2, 0.5, 0.8];

    @property
    public backgroundWidth: number = 2048;

    private _lastPlayerPos: Vec3 = new Vec3();

    start() {
        if (!this.player) {
            this.player = find('Player');
        }

        if (this.player) {
            this._lastPlayerPos.set(this.player.position);
            console.log('ParallaxBackground: 初始化成功，背景层数:', this.backgroundLayers.length);
        } else {
            console.error('ParallaxBackground: 找不到Player节点');
        }

        // 确保速度数组和背景层数量匹配
        while (this.layerSpeeds.length < this.backgroundLayers.length) {
            this.layerSpeeds.push(0.5);
        }
    }

    lateUpdate(deltaTime: number) {
        if (!this.player) return;

        const currentPlayerPos = this.player.position;
        const deltaX = currentPlayerPos.x - this._lastPlayerPos.x;

        // 更新每一层背景
        for (let i = 0; i < this.backgroundLayers.length; i++) {
            const layer = this.backgroundLayers[i];
            if (!layer) continue;

            const speed = this.layerSpeeds[i] || 0.5;
            const currentPos = layer.position;
            
            // 计算新位置
            const newX = currentPos.x - deltaX * speed;
            
            // 循环处理：当背景移动超出范围时重置位置
            let wrappedX = newX;
            if (newX <= -this.backgroundWidth) {
                wrappedX = newX + this.backgroundWidth;
            } else if (newX >= this.backgroundWidth) {
                wrappedX = newX - this.backgroundWidth;
            }
            
            layer.setPosition(wrappedX, currentPos.y, currentPos.z);
        }

        this._lastPlayerPos.set(currentPlayerPos);
    }

    /**
     * 动态添加背景层
     * @param layer 背景层节点
     * @param speed 移动速度比例
     */
    public addBackgroundLayer(layer: Node, speed: number = 0.5) {
        this.backgroundLayers.push(layer);
        this.layerSpeeds.push(speed);
    }

    /**
     * 设置某层的移动速度
     * @param layerIndex 层索引
     * @param speed 速度比例
     */
    public setLayerSpeed(layerIndex: number, speed: number) {
        if (layerIndex >= 0 && layerIndex < this.layerSpeeds.length) {
            this.layerSpeeds[layerIndex] = speed;
        }
    }
}

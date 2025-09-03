import { _decorator, Component, Node, Vec3, Camera } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 摄像机控制器组件
 * 用于让摄像机跟随目标对象移动
 */
@ccclass('CameraController')
export class CameraController extends Component {
    @property(Node)
    public target: Node = null!;

    @property
    public followSpeed: number = 5;

    @property
    public smoothFollow: boolean = true;

    @property
    public offsetX: number = 0;

    @property
    public offsetY: number = 0;

    @property
    public mapWidth: number = 2048;

    @property
    public mapHeight: number = 2048;

    private _camera: Camera = null!;
    private _targetPosition: Vec3 = new Vec3();

    start() {
        this._camera = this.getComponent(Camera)!;
        if (!this._camera) {
            console.error("CameraController: 需要Camera组件");
            return;
        }

        if (!this.target) {
            console.error("CameraController: 需要设置跟随目标");
            return;
        }
    }

    lateUpdate(deltaTime: number) {
        if (!this.target || !this._camera) {
            return;
        }

        // 获取目标位置
        const targetPos = this.target.position;
        
        // 计算摄像机应该移动到的位置
        this._targetPosition.set(
            targetPos.x + this.offsetX,
            targetPos.y + this.offsetY,
            this.node.position.z
        );

        // 限制摄像机在地图边界内
        this._targetPosition.x = this.clampToBounds(
            this._targetPosition.x, 
            -this.mapWidth / 2 + this._camera.orthoHeight * this._camera.node.parent!.getComponent('cc.UITransform')!.contentSize.width / this._camera.node.parent!.getComponent('cc.UITransform')!.contentSize.height / 2,
            this.mapWidth / 2 - this._camera.orthoHeight * this._camera.node.parent!.getComponent('cc.UITransform')!.contentSize.width / this._camera.node.parent!.getComponent('cc.UITransform')!.contentSize.height / 2
        );
        
        this._targetPosition.y = this.clampToBounds(
            this._targetPosition.y,
            -this.mapHeight / 2 + this._camera.orthoHeight / 2,
            this.mapHeight / 2 - this._camera.orthoHeight / 2
        );

        if (this.smoothFollow) {
            // 平滑跟随
            const currentPos = this.node.position;
            const newPos = currentPos.lerp(this._targetPosition, this.followSpeed * deltaTime);
            this.node.setPosition(newPos);
        } else {
            // 直接跟随
            this.node.setPosition(this._targetPosition);
        }
    }

    private clampToBounds(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 设置地图边界
     * @param width 地图宽度
     * @param height 地图高度
     */
    public setMapBounds(width: number, height: number) {
        this.mapWidth = width;
        this.mapHeight = height;
    }

    /**
     * 设置跟随目标
     * @param target 目标节点
     */
    public setTarget(target: Node) {
        this.target = target;
    }
}

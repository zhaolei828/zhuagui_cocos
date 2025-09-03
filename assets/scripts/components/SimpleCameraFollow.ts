import { _decorator, Component, Node, Vec3, Camera } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 简单摄像机跟随组件
 * 更简化的摄像机跟随实现
 */
@ccclass('SimpleCameraFollow')
export class SimpleCameraFollow extends Component {
    @property(Node)
    public target: Node = null!;

    @property
    public followSpeed: number = 5;

    @property
    public smoothFollow: boolean = true;

    private _targetPosition: Vec3 = new Vec3();

    start() {
        if (!this.target) {
            console.error("SimpleCameraFollow: 需要设置跟随目标");
            return;
        }
    }

    lateUpdate(deltaTime: number) {
        if (!this.target) {
            return;
        }

        // 获取目标位置，保持摄像机的Z坐标
        const targetPos = this.target.position;
        this._targetPosition.set(targetPos.x, targetPos.y, this.node.position.z);

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

    /**
     * 设置跟随目标
     * @param target 目标节点
     */
    public setTarget(target: Node) {
        this.target = target;
    }
}

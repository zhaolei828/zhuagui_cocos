import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 更简单的摄像机跟随组件
 * 用于调试和确保基本功能正常
 */
@ccclass('SimpleFollow')
export class SimpleFollow extends Component {
    @property(Node)
    public target: Node = null!;

    @property
    public followSpeed: number = 5;

    start() {
        if (!this.target) {
            console.error("SimpleFollow: 请设置跟随目标！");
            return;
        }
        console.log("SimpleFollow: 组件启动成功，目标节点:", this.target.name);
    }

    lateUpdate(deltaTime: number) {
        if (!this.target) {
            return;
        }

        // 获取目标位置
        const targetPos = this.target.position;
        const currentPos = this.node.position;
        
        // 计算新位置（保持摄像机的Z坐标）
        const newPos = new Vec3(
            targetPos.x,
            targetPos.y,
            currentPos.z
        );

        // 平滑移动到新位置
        const lerpPos = currentPos.lerp(newPos, this.followSpeed * deltaTime);
        this.node.setPosition(lerpPos);

        // 调试信息（可选，测试时启用）
        // console.log(`摄像机位置: (${lerpPos.x.toFixed(1)}, ${lerpPos.y.toFixed(1)}), 目标位置: (${targetPos.x.toFixed(1)}, ${targetPos.y.toFixed(1)})`);
    }
}

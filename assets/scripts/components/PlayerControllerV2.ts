import { _decorator, Component, Node, Vec3, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 改进版玩家控制器组件
 * 增加了边界限制功能
 */
@ccclass('PlayerControllerV2')
export class PlayerControllerV2 extends Component {
    @property
    public speed: number = 200;

    @property
    public mapWidth: number = 2048;

    @property
    public mapHeight: number = 2048;

    @property
    public enableBoundary: boolean = true;

    private _moveDir: Vec3 = new Vec3();

    start() {
        // 注册键盘输入事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        
        console.log("PlayerControllerV2: 启动成功，边界限制:", this.enableBoundary ? "开启" : "关闭");
    }

    onDestroy() {
        // 取消事件监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this._moveDir.x = -1;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this._moveDir.x = 1;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this._moveDir.y = 1;
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this._moveDir.y = -1;
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this._moveDir.x = 0;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this._moveDir.y = 0;
                break;
        }
    }

    update(deltaTime: number) {
        if (this._moveDir.length() > 0) {
            const pos = this.node.position;
            const movement = new Vec3(
                this._moveDir.x * this.speed * deltaTime,
                this._moveDir.y * this.speed * deltaTime,
                0
            );
            
            // 计算新位置
            let newPos = pos.add(movement);
            
            // 边界限制
            if (this.enableBoundary) {
                const halfWidth = this.mapWidth / 2;
                const halfHeight = this.mapHeight / 2;
                
                newPos.x = Math.max(-halfWidth, Math.min(halfWidth, newPos.x));
                newPos.y = Math.max(-halfHeight, Math.min(halfHeight, newPos.y));
            }
            
            this.node.setPosition(newPos);
        }
    }
}

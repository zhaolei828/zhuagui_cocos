import { _decorator, Component, Node, Vec3, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 玩家控制器组件
 * 用于处理玩家输入和移动
 */
@ccclass('PlayerController')
export class PlayerController extends Component {
    @property
    public speed: number = 200;

    private _moveDir: Vec3 = new Vec3();

    start() {
        // 注册键盘输入事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
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
            this.node.setPosition(pos.add(movement));
        }
    }
}

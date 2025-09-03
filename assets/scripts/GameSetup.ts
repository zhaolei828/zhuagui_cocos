import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏设置组件
 * 用于初始化游戏场景中的各种设置
 */
@ccclass('GameSetup')
export class GameSetup extends Component {
    
    start() {
        this.setupScene();
    }

    private setupScene() {
        // 设置摄像机跟随
        const camera = find('Main Camera');
        const player = find('Player');
        
        if (camera && player) {
            const cameraFollow = camera.getComponent('SimpleCameraFollow');
            if (cameraFollow) {
                cameraFollow.setTarget(player);
                console.log('摄像机跟随设置完成');
            }
        }

        console.log('游戏场景初始化完成');
        console.log('使用方向键或WASD键控制小人移动');
        console.log('摄像机会自动跟随小人移动');
    }
}

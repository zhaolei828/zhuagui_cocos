import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏管理器
 * 管理游戏的整体状态和流程
 */
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    
    public static get instance(): GameManager {
        return this._instance;
    }

    @property
    public gameState: GameState = GameState.Menu;

    start() {
        GameManager._instance = this;
        this.initGame();
    }

    private initGame() {
        console.log("游戏初始化完成");
        // 在这里添加游戏初始化逻辑
    }

    /**
     * 开始游戏
     */
    public startGame() {
        this.gameState = GameState.Playing;
        console.log("游戏开始");
        // 在这里添加游戏开始逻辑
    }

    /**
     * 暂停游戏
     */
    public pauseGame() {
        this.gameState = GameState.Paused;
        console.log("游戏暂停");
        // 在这里添加游戏暂停逻辑
    }

    /**
     * 结束游戏
     */
    public endGame() {
        this.gameState = GameState.GameOver;
        console.log("游戏结束");
        // 在这里添加游戏结束逻辑
    }

    /**
     * 重启游戏
     */
    public restartGame() {
        this.gameState = GameState.Playing;
        console.log("重新开始游戏");
        // 在这里添加重启游戏逻辑
    }
}

/**
 * 游戏状态枚举
 */
export enum GameState {
    Menu = 0,
    Playing = 1,
    Paused = 2,
    GameOver = 3
}

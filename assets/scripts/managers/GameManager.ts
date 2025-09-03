import { _decorator, Component, Node, Input, input, EventKeyboard, KeyCode, Vec3 } from 'cc';
import { MapGenerator } from './MapGenerator';
import { TileMapRenderer } from './TileMapRenderer';

const { ccclass, property } = _decorator;

/**
 * 游戏管理器 - 整合地图生成、玩家控制等核心系统
 * 支持随机地图生成和重新生成功能
 */

@ccclass('GameManager')
export class GameManager extends Component {
    
    @property({ type: MapGenerator, tooltip: "地图生成器" })
    mapGenerator: MapGenerator = null!;
    
    @property({ type: TileMapRenderer, tooltip: "地图渲染器" })
    mapRenderer: TileMapRenderer = null!;
    
    @property({ type: Node, tooltip: "玩家节点" })
    player: Node = null!;
    
    @property({ type: Node, tooltip: "摄像机节点" })
    cameraNode: Node = null!;
    
    @property({ tooltip: "玩家移动速度" })
    playerSpeed: number = 200;
    
    // 控制状态
    private inputStates = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    
    // 游戏状态
    private isGameActive: boolean = false;
    
    start() {
        this.initializeGame();
        this.setupInput();
    }
    
    /**
     * 初始化游戏
     */
    private initializeGame(): void {
        console.log(`🎮 游戏初始化开始...`);
        
        // 生成第一张地图
        this.generateNewMap();
        
        this.isGameActive = true;
        console.log(`✅ 游戏初始化完成`);
    }
    
    /**
     * 设置输入监听
     */
    private setupInput(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    
    /**
     * 按键按下事件
     */
    private onKeyDown(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.inputStates.left = true;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.inputStates.right = true;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.inputStates.up = true;
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.inputStates.down = true;
                break;
            case KeyCode.KEY_R:
                // R键重新生成地图
                this.generateNewMap();
                break;
            case KeyCode.SPACE:
                // 空格键暂停/恢复
                this.togglePause();
                break;
        }
    }
    
    /**
     * 按键释放事件
     */
    private onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.inputStates.left = false;
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.inputStates.right = false;
                break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.inputStates.up = false;
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.inputStates.down = false;
                break;
        }
    }
    
    update(deltaTime: number) {
        if (!this.isGameActive) return;
        
        this.updatePlayerMovement(deltaTime);
        this.updateCamera();
    }
    
    /**
     * 更新玩家移动
     */
    private updatePlayerMovement(deltaTime: number): void {
        if (!this.player || !this.mapRenderer) return;
        
        let moveX = 0;
        let moveY = 0;
        
        // 计算移动方向
        if (this.inputStates.left) moveX -= 1;
        if (this.inputStates.right) moveX += 1;
        if (this.inputStates.up) moveY += 1;
        if (this.inputStates.down) moveY -= 1;
        
        // 归一化对角线移动
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // √2/2
            moveY *= 0.707;
        }
        
        // 计算新位置
        const currentPos = this.player.getPosition();
        const newX = currentPos.x + moveX * this.playerSpeed * deltaTime;
        const newY = currentPos.y + moveY * this.playerSpeed * deltaTime;
        
        // 检查碰撞
        const gridPos = this.mapRenderer.worldToGrid(new Vec3(newX, newY, 0));
        
        if (this.mapRenderer.isWalkable(gridPos.x, gridPos.y)) {
            this.player.setPosition(newX, newY, currentPos.z);
        } else {
            // 尝试单轴移动
            const testX = this.mapRenderer.worldToGrid(new Vec3(newX, currentPos.y, 0));
            const testY = this.mapRenderer.worldToGrid(new Vec3(currentPos.x, newY, 0));
            
            if (this.mapRenderer.isWalkable(testX.x, testX.y)) {
                this.player.setPosition(newX, currentPos.y, currentPos.z);
            } else if (this.mapRenderer.isWalkable(testY.x, testY.y)) {
                this.player.setPosition(currentPos.x, newY, currentPos.z);
            }
        }
    }
    
    /**
     * 更新摄像机跟随
     */
    private updateCamera(): void {
        if (!this.cameraNode || !this.player) return;
        
        const playerPos = this.player.getPosition();
        
        // 平滑跟随
        const currentCameraPos = this.cameraNode.getPosition();
        const lerpFactor = 0.05; // 跟随平滑度
        
        const newCameraX = currentCameraPos.x + (playerPos.x - currentCameraPos.x) * lerpFactor;
        const newCameraY = currentCameraPos.y + (playerPos.y - currentCameraPos.y) * lerpFactor;
        
        this.cameraNode.setPosition(newCameraX, newCameraY, currentCameraPos.z);
    }
    
    /**
     * 生成新地图
     */
    public generateNewMap(seed?: number): void {
        console.log(`🗺️ 开始生成新地图...`);
        
        if (!this.mapGenerator || !this.mapRenderer) {
            console.error('❌ 地图生成器或渲染器未设置');
            return;
        }
        
        // 生成地图数据
        this.mapGenerator.generateNewMap(seed);
        
        // 渲染地图
        this.mapRenderer.renderMap();
        
        // 将玩家移动到出生点
        if (this.player) {
            const spawnPos = this.mapGenerator.getSpawnPosition();
            this.player.setPosition(spawnPos);
            console.log(`👤 玩家位置设置为: (${spawnPos.x}, ${spawnPos.y})`);
            
            // 摄像机立即跟上
            if (this.cameraNode) {
                this.cameraNode.setPosition(spawnPos.x, spawnPos.y, this.cameraNode.getPosition().z);
                console.log(`📷 摄像机位置设置为: (${spawnPos.x}, ${spawnPos.y}, ${this.cameraNode.getPosition().z})`);
            }
        }
        
        console.log(`✅ 新地图生成完成！按R键重新生成`);
    }
    
    /**
     * 暂停/恢复游戏
     */
    private togglePause(): void {
        this.isGameActive = !this.isGameActive;
        console.log(this.isGameActive ? '▶️ 游戏恢复' : '⏸️ 游戏暂停');
    }
    
    /**
     * 获取当前房间信息
     */
    public getCurrentRoom(): any {
        if (!this.player || !this.mapRenderer || !this.mapGenerator) return null;
        
        const playerPos = this.player.getPosition();
        const gridPos = this.mapRenderer.worldToGrid(playerPos);
        const rooms = this.mapGenerator.getRooms();
        
        // 查找玩家所在的房间
        for (const room of rooms) {
            if (gridPos.x >= room.x && gridPos.x < room.x + room.width &&
                gridPos.y >= room.y && gridPos.y < room.y + room.height) {
                return room;
            }
        }
        
        return null;
    }
    
    /**
     * 获取游戏统计信息
     */
    public getGameStats(): any {
        const rooms = this.mapGenerator ? this.mapGenerator.getRooms() : [];
        const currentRoom = this.getCurrentRoom();
        
        return {
            totalRooms: rooms.length,
            currentRoomType: currentRoom ? currentRoom.type : 'corridor',
            playerPosition: this.player ? this.player.getPosition() : new Vec3(0, 0, 0),
            isGameActive: this.isGameActive
        };
    }
    
    onDestroy() {
        // 清理输入监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}
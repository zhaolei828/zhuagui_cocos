import { _decorator, Component, Node, Prefab, instantiate, Vec3, SpriteFrame, Sprite, Color, UITransform } from 'cc';
import { MapCell, MapCellType, MapGenerator } from './MapGenerator';
import { SpriteUtils } from '../utils/SpriteUtils';

const { ccclass, property } = _decorator;

/**
 * 瓦片地图渲染器 - 负责将地图数据渲染为可视化元素
 * 配合MapGenerator使用，实现程序化生成的地图可视化
 */

@ccclass('TileMapRenderer')
export class TileMapRenderer extends Component {
    
    @property({ type: MapGenerator, tooltip: "地图生成器引用" })
    mapGenerator: MapGenerator = null!;
    
    @property({ type: Node, tooltip: "瓦片容器节点" })
    tileContainer: Node = null!;
    
    // 瓦片预制体
    @property({ type: Prefab, tooltip: "地板瓦片预制体" })
    floorTilePrefab: Prefab = null!;
    
    @property({ type: Prefab, tooltip: "墙壁瓦片预制体" })
    wallTilePrefab: Prefab = null!;
    
    @property({ type: Prefab, tooltip: "走廊瓦片预制体" })
    corridorTilePrefab: Prefab = null!;
    
    @property({ type: Prefab, tooltip: "门瓦片预制体" })
    doorTilePrefab: Prefab = null!;
    
    // 内容预制体
    @property({ type: Prefab, tooltip: "玩家出生点预制体" })
    spawnPointPrefab: Prefab = null!;
    
    @property({ type: Prefab, tooltip: "宝箱预制体" })
    treasureChestPrefab: Prefab = null!;
    
    @property({ type: Prefab, tooltip: "普通敌人预制体" })
    normalEnemyPrefab: Prefab = null!;
    
    @property({ type: Prefab, tooltip: "Boss敌人预制体" })
    bossEnemyPrefab: Prefab = null!;
    
    // 基础纹理资源
    @property({ type: SpriteFrame, tooltip: "白色基础纹理（用于彩色瓦片）" })
    whiteSpriteFrame: SpriteFrame = null!;
    
    // 瓦片池
    private tilePool: Map<MapCellType, Node[]> = new Map();
    private activeNodes: Node[] = [];
    
    start() {
        this.initializeTilePools();
        this.setupTileContainer();
    }
    
    /**
     * 设置瓦片容器
     */
    private setupTileContainer(): void {
        if (!this.tileContainer) return;
        
        // 确保容器有UITransform组件（2D节点必需）
        let transform = this.tileContainer.getComponent(UITransform);
        if (!transform) {
            transform = this.tileContainer.addComponent(UITransform);
            console.log('✅ 为MapRoot添加了UITransform组件');
        }
        
        // 设置容器大小
        transform.setContentSize(1600, 1600); // 50*32的地图大小
        
        // 确保在正确的层级
        this.tileContainer.layer = 1073741824; // DEFAULT层
        
        console.log(`📦 地图容器设置完成，层级: ${this.tileContainer.layer}`);
    }
    
    /**
     * 初始化瓦片对象池
     */
    private initializeTilePools(): void {
        const poolSize = 100; // 每种类型的初始池大小
        
        // 为每种瓦片类型创建对象池
        const cellTypes = [
            MapCellType.FLOOR,
            MapCellType.WALL,
            MapCellType.CORRIDOR,
            MapCellType.DOOR
        ];
        
        for (const cellType of cellTypes) {
            this.tilePool.set(cellType, []);
            const prefab = this.getPrefabForCellType(cellType);
            
            if (prefab) {
                for (let i = 0; i < poolSize; i++) {
                    const node = instantiate(prefab);
                    node.active = false;
                    this.tileContainer.addChild(node);
                    this.tilePool.get(cellType)!.push(node);
                }
            }
        }
        
        console.log(`🏊‍♂️ 瓦片对象池初始化完成`);
    }
    
    /**
     * 渲染整个地图
     */
    public renderMap(): void {
        if (!this.mapGenerator) {
            console.error('❌ MapGenerator 未设置');
            return;
        }
        
        // 清除当前渲染的瓦片
        this.clearRenderedTiles();
        
        const mapData = this.mapGenerator.getMapData();
        const cellSize = 32; // 从MapGenerator获取
        
        // 渲染每个瓦片
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[y].length; x++) {
                const cell = mapData[y][x];
                this.renderCell(cell, x, y, cellSize);
            }
        }
        
        // 渲染房间内容
        this.renderRoomContent();
        
        console.log(`🎨 地图渲染完成，共渲染 ${this.activeNodes.length} 个瓦片`);
        console.log(`📍 地图容器层级: ${this.tileContainer.layer}`);
    }
    
    /**
     * 渲染单个格子
     */
    private renderCell(cell: MapCell, x: number, y: number, cellSize: number): void {
        // 跳过空格子
        if (cell.type === MapCellType.EMPTY) {
            return;
        }
        
        const tileNode = this.getTileFromPool(cell.type);
        if (!tileNode) return;
        
        // 设置位置 - 调整坐标系
        const worldX = (x - 25) * cellSize; // 居中显示
        const worldY = (25 - y) * cellSize; // Cocos Creator的Y轴向上为正，居中显示
        tileNode.setPosition(worldX, worldY, 0);
        
        // 确保节点在正确的层级（DEFAULT层）
        tileNode.layer = 1073741824; // DEFAULT层的值
        
        // 设置颜色和样式
        this.styleTile(tileNode, cell.type);
        
        tileNode.active = true;
        this.activeNodes.push(tileNode);
    }
    
    /**
     * 渲染房间内容（敌人、宝箱等）
     */
    private renderRoomContent(): void {
        const rooms = this.mapGenerator.getRooms();
        const cellSize = 32;
        
        for (const room of rooms) {
            for (const content of room.content) {
                const contentNode = this.createContentNode(content.type, content.prefab);
                if (contentNode) {
                    const worldX = content.x * cellSize;
                    const worldY = -content.y * cellSize;
                    contentNode.setPosition(worldX, worldY, 1); // Z=1 确保在瓦片之上
                    
                    this.tileContainer.addChild(contentNode);
                    this.activeNodes.push(contentNode);
                }
            }
        }
        
        // 特殊标记：出生点
        const mapData = this.mapGenerator.getMapData();
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[y].length; x++) {
                if (mapData[y][x].type === MapCellType.SPAWN) {
                    const spawnNode = this.createContentNode('spawn');
                    if (spawnNode) {
                        const worldX = x * cellSize;
                        const worldY = -y * cellSize;
                        spawnNode.setPosition(worldX, worldY, 1);
                        
                        this.tileContainer.addChild(spawnNode);
                        this.activeNodes.push(spawnNode);
                    }
                }
            }
        }
    }
    
    /**
     * 从对象池获取瓦片
     */
    private getTileFromPool(cellType: MapCellType): Node | null {
        const pool = this.tilePool.get(cellType);
        if (!pool || pool.length === 0) {
            // 池子空了，动态创建新的
            return this.createNewTile(cellType);
        }
        
        return pool.pop()!;
    }
    
    /**
     * 创建新瓦片
     */
    private createNewTile(cellType: MapCellType): Node | null {
        const prefab = this.getPrefabForCellType(cellType);
        if (!prefab) {
            // 如果没有预制体，创建一个简单的彩色方块
            return this.createSimpleTile(cellType);
        }
        
        const node = instantiate(prefab);
        this.tileContainer.addChild(node);
        return node;
    }
    
    /**
     * 创建简单的彩色瓦片（用于调试或缺少美术资源时）
     */
    private createSimpleTile(cellType: MapCellType): Node {
        const node = new Node(`Tile_${MapCellType[cellType]}`);
        
        // 添加UITransform组件（2D节点必需）
        const transform = node.addComponent(UITransform);
        transform.setContentSize(30, 30);
        
        // 使用Sprite组件
        const sprite = node.addComponent(Sprite);
        
        // 根据类型获取颜色并设置
        const color = this.getColorForCellType(cellType);
        
        // 使用白色SpriteFrame作为基础
        if (this.whiteSpriteFrame) {
            sprite.spriteFrame = this.whiteSpriteFrame;
            sprite.color = color;
            console.log(`🎨 使用SpriteFrame设置颜色: r=${color.r} g=${color.g} b=${color.b}`);
        } else {
            // 备选方案：使用SpriteUtils
            SpriteUtils.setColorSprite(sprite, color);
            console.log(`⚠️ 使用备选SpriteFrame方案`);
        }
        
        // 确保在正确的层级
        node.layer = 1073741824; // DEFAULT层
        
        this.tileContainer.addChild(node);
        return node;
    }
    
    /**
     * 创建内容节点（敌人、宝箱等）
     */
    private createContentNode(contentType: string, prefabName?: string): Node | null {
        let prefab: Prefab | null = null;
        
        switch (contentType) {
            case 'enemy':
                prefab = prefabName === 'BossEnemy' ? this.bossEnemyPrefab : this.normalEnemyPrefab;
                break;
            case 'treasure':
                prefab = this.treasureChestPrefab;
                break;
            case 'spawn':
                prefab = this.spawnPointPrefab;
                break;
        }
        
        if (prefab) {
            return instantiate(prefab);
        } else {
            // 创建简单的调试节点
            return this.createDebugContentNode(contentType);
        }
    }
    
    /**
     * 创建调试用的内容节点
     */
    private createDebugContentNode(contentType: string): Node {
        const node = new Node(`Content_${contentType}`);
        
        // 使用Sprite组件
        const sprite = node.addComponent(Sprite);
        const transform = node.addComponent(UITransform);
        
        // 设置大小
        transform.setContentSize(24, 24);
        
        // 设置不同内容类型的颜色
        let color: Color;
        switch (contentType) {
            case 'enemy':
                color = Color.RED;
                break;
            case 'treasure':
                color = Color.YELLOW;
                break;
            case 'spawn':
                color = Color.GREEN;
                break;
            default:
                color = Color.MAGENTA;
        }
        
        // 使用白色SpriteFrame作为基础
        if (this.whiteSpriteFrame) {
            sprite.spriteFrame = this.whiteSpriteFrame;
            sprite.color = color;
        } else {
            SpriteUtils.setColorSprite(sprite, color);
        }
        
        return node;
    }
    
    /**
     * 设置瓦片样式
     */
    private styleTile(tileNode: Node, cellType: MapCellType): void {
        const sprite = tileNode.getComponent(Sprite);
        if (sprite) {
            sprite.color = this.getColorForCellType(cellType);
        }
    }
    
    /**
     * 获取对应的预制体
     */
    private getPrefabForCellType(cellType: MapCellType): Prefab | null {
        switch (cellType) {
            case MapCellType.FLOOR:
                return this.floorTilePrefab;
            case MapCellType.WALL:
                return this.wallTilePrefab;
            case MapCellType.CORRIDOR:
                return this.corridorTilePrefab;
            case MapCellType.DOOR:
                return this.doorTilePrefab;
            default:
                return null;
        }
    }
    
    /**
     * 获取瓦片类型对应的颜色
     */
    private getColorForCellType(cellType: MapCellType): Color {
        switch (cellType) {
            case MapCellType.FLOOR:
                return new Color(200, 200, 200, 255); // 浅灰色
            case MapCellType.WALL:
                return new Color(100, 100, 100, 255); // 深灰色
            case MapCellType.CORRIDOR:
                return new Color(150, 150, 150, 255); // 中灰色
            case MapCellType.DOOR:
                return new Color(139, 69, 19, 255);   // 棕色
            case MapCellType.ROOM:
                return new Color(220, 220, 220, 255); // 更浅的灰色
            default:
                return Color.WHITE;
        }
    }
    
    /**
     * 清除当前渲染的瓦片
     */
    private clearRenderedTiles(): void {
        // 将活跃的瓦片回收到对象池
        for (const node of this.activeNodes) {
            node.active = false;
            
            // 根据节点名称判断类型并回收到对应池子
            const nodeTypeName = node.name.split('_')[1];
            if (nodeTypeName) {
                for (const [cellType, pool] of this.tilePool) {
                    if (MapCellType[cellType] === nodeTypeName) {
                        pool.push(node);
                        break;
                    }
                }
            } else {
                // 如果不是池化的节点，直接销毁
                node.destroy();
            }
        }
        
        this.activeNodes = [];
    }
    
    /**
     * 获取世界坐标对应的格子坐标
     */
    public worldToGrid(worldPos: Vec3): { x: number, y: number } {
        const cellSize = 32;
        return {
            x: Math.floor(worldPos.x / cellSize),
            y: Math.floor(-worldPos.y / cellSize) // 注意Y轴转换
        };
    }
    
    /**
     * 获取格子坐标对应的世界坐标
     */
    public gridToWorld(gridX: number, gridY: number): Vec3 {
        const cellSize = 32;
        return new Vec3(gridX * cellSize, -gridY * cellSize, 0);
    }
    
    /**
     * 检查指定位置是否可以通行
     */
    public isWalkable(gridX: number, gridY: number): boolean {
        const mapData = this.mapGenerator.getMapData();
        
        if (gridY < 0 || gridY >= mapData.length || gridX < 0 || gridX >= mapData[0].length) {
            return false;
        }
        
        const cellType = mapData[gridY][gridX].type;
        return cellType === MapCellType.FLOOR || 
               cellType === MapCellType.CORRIDOR || 
               cellType === MapCellType.DOOR ||
               cellType === MapCellType.SPAWN;
    }
    
    /**
     * 强制重新渲染地图
     */
    public forceRender(): void {
        this.renderMap();
    }
}

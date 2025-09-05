import { _decorator, Component, Node, Prefab, instantiate, Vec3, Size, UITransform, TiledMap, TiledLayer } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 地图生成器 - 负责程序化生成随机地图
 * 参考鸠摩智转刀2的房间-走廊系统
 */

export interface MapCell {
    x: number;
    y: number;
    type: MapCellType;
    isConnected: boolean;
    connections: MapCell[];
}

export enum MapCellType {
    EMPTY = 0,      // 空地
    WALL = 1,       // 墙壁
    FLOOR = 2,      // 地板
    ROOM = 3,       // 房间
    CORRIDOR = 4,   // 走廊
    DOOR = 5,       // 门
    SPAWN = 6,      // 出生点
    EXIT = 7,       // 出口
    TREASURE = 8,   // 宝箱
    ENEMY_SPAWN = 9 // 敌人刷新点
}

export interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
    type: RoomType;
    isMainPath: boolean;
    connections: Room[];
    content: RoomContent[];
}

export enum RoomType {
    NORMAL = 'normal',
    BOSS = 'boss',
    TREASURE = 'treasure',
    SPAWN = 'spawn',
    SECRET = 'secret'
}

export interface RoomContent {
    type: 'enemy' | 'treasure' | 'decoration' | 'obstacle';
    x: number;
    y: number;
    prefab?: string;
}

@ccclass('MapGenerator')
export class MapGenerator extends Component {
    
    @property({ type: Node, tooltip: "地图根节点" })
    mapRoot: Node = null!;
    
    @property({ tooltip: "地图宽度（格子数）" })
    mapWidth: number = 50;
    
    @property({ tooltip: "地图高度（格子数）" })
    mapHeight: number = 50;
    
    @property({ tooltip: "最小房间数量" })
    minRooms: number = 8;
    
    @property({ tooltip: "最大房间数量" })
    maxRooms: number = 15;
    
    @property({ tooltip: "最小房间大小" })
    minRoomSize: number = 5;
    
    @property({ tooltip: "最大房间大小" })
    maxRoomSize: number = 12;
    
    @property({ tooltip: "格子大小（像素）" })
    cellSize: number = 32;
    
    // 地图数据
    private mapData: MapCell[][] = [];
    private rooms: Room[] = [];
    private currentSeed: number = 0;
    
    start() {
        this.generateNewMap();
    }
    
    /**
     * 生成新地图
     */
    public generateNewMap(seed?: number): void {
        this.currentSeed = seed || Date.now();
        this.initializeMap();
        this.generateRooms();
        this.connectRooms();
        this.generateCorridors();
        this.placeContent();
        
        console.log(`🗺️ 地图生成完成，种子：${this.currentSeed}`);
    }
    
    /**
     * 初始化地图数据
     */
    private initializeMap(): void {
        this.mapData = [];
        this.rooms = [];
        
        for (let y = 0; y < this.mapHeight; y++) {
            this.mapData[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                this.mapData[y][x] = {
                    x,
                    y,
                    type: MapCellType.WALL,
                    isConnected: false,
                    connections: []
                };
            }
        }
    }
    
    /**
     * 生成房间
     */
    private generateRooms(): void {
        const roomCount = this.random(this.minRooms, this.maxRooms);
        const attempts = roomCount * 10; // 避免无限循环
        let createdRooms = 0;
        
        // 生成出生房间
        const spawnRoom = this.createRoom(
            Math.floor(this.mapWidth * 0.1),
            Math.floor(this.mapHeight * 0.1),
            this.random(this.minRoomSize, this.minRoomSize + 2),
            this.random(this.minRoomSize, this.minRoomSize + 2),
            RoomType.SPAWN
        );
        
        if (spawnRoom) {
            this.rooms.push(spawnRoom);
            createdRooms++;
        }
        
        // 生成其他房间
        for (let i = 0; i < attempts && createdRooms < roomCount; i++) {
            const x = this.random(1, this.mapWidth - this.maxRoomSize - 1);
            const y = this.random(1, this.mapHeight - this.maxRoomSize - 1);
            const width = this.random(this.minRoomSize, this.maxRoomSize);
            const height = this.random(this.minRoomSize, this.maxRoomSize);
            
            const room = this.createRoom(x, y, width, height, RoomType.NORMAL);
            if (room) {
                this.rooms.push(room);
                createdRooms++;
            }
        }
        
        // 生成Boss房间
        if (this.rooms.length > 0) {
            const bossRoom = this.createRoom(
                Math.floor(this.mapWidth * 0.8),
                Math.floor(this.mapHeight * 0.8),
                this.random(this.maxRoomSize - 2, this.maxRoomSize),
                this.random(this.maxRoomSize - 2, this.maxRoomSize),
                RoomType.BOSS
            );
            
            if (bossRoom) {
                this.rooms.push(bossRoom);
            }
        }
        
        console.log(`🏠 生成了 ${this.rooms.length} 个房间`);
    }
    
    /**
     * 创建单个房间
     */
    private createRoom(x: number, y: number, width: number, height: number, type: RoomType): Room | null {
        // 检查是否与已有房间重叠
        for (const existingRoom of this.rooms) {
            if (this.roomsOverlap(x, y, width, height, existingRoom)) {
                return null;
            }
        }
        
        const room: Room = {
            x,
            y,
            width,
            height,
            type,
            isMainPath: false,
            connections: [],
            content: []
        };
        
        // 在地图数据中标记房间
        for (let ry = y; ry < y + height; ry++) {
            for (let rx = x; rx < x + width; rx++) {
                if (this.isValidPosition(rx, ry)) {
                    this.mapData[ry][rx].type = MapCellType.FLOOR;
                }
            }
        }
        
        return room;
    }
    
    /**
     * 检查房间是否重叠
     */
    private roomsOverlap(x: number, y: number, width: number, height: number, room: Room): boolean {
        const buffer = 2; // 房间间的缓冲距离
        return !(x + width + buffer < room.x || 
                x - buffer > room.x + room.width ||
                y + height + buffer < room.y || 
                y - buffer > room.y + room.height);
    }
    
    /**
     * 连接房间
     */
    private connectRooms(): void {
        if (this.rooms.length < 2) return;
        
        // 使用最小生成树算法连接所有房间
        const connected = new Set<Room>();
        const unconnected = new Set(this.rooms);
        
        // 从出生房间开始
        const startRoom = this.rooms.find(r => r.type === RoomType.SPAWN) || this.rooms[0];
        connected.add(startRoom);
        unconnected.delete(startRoom);
        startRoom.isMainPath = true;
        
        while (unconnected.size > 0) {
            let shortestDistance = Infinity;
            let closestPair: [Room, Room] | null = null;
            
            // 找到最近的房间对
            for (const connectedRoom of connected) {
                for (const unconnectedRoom of unconnected) {
                    const distance = this.getDistance(connectedRoom, unconnectedRoom);
                    if (distance < shortestDistance) {
                        shortestDistance = distance;
                        closestPair = [connectedRoom, unconnectedRoom];
                    }
                }
            }
            
            if (closestPair) {
                const [room1, room2] = closestPair;
                room1.connections.push(room2);
                room2.connections.push(room1);
                room2.isMainPath = true;
                
                connected.add(room2);
                unconnected.delete(room2);
            }
        }
        
        console.log(`🔗 房间连接完成`);
    }
    
    /**
     * 生成走廊
     */
    private generateCorridors(): void {
        for (const room of this.rooms) {
            for (const connectedRoom of room.connections) {
                this.createCorridor(room, connectedRoom);
            }
        }
    }
    
    /**
     * 创建两个房间之间的走廊
     */
    private createCorridor(room1: Room, room2: Room): void {
        const start = this.getRoomCenter(room1);
        const end = this.getRoomCenter(room2);
        
        // L型走廊：先水平再垂直
        let currentX = start.x;
        let currentY = start.y;
        
        // 记录路径以便后续放置门
        const corridorPath: {x: number, y: number}[] = [];
        
        // 水平移动
        while (currentX !== end.x) {
            if (this.isValidPosition(currentX, currentY)) {
                if (this.mapData[currentY][currentX].type === MapCellType.WALL) {
                    this.mapData[currentY][currentX].type = MapCellType.CORRIDOR;
                    corridorPath.push({x: currentX, y: currentY});
                }
            }
            currentX += currentX < end.x ? 1 : -1;
        }
        
        // 垂直移动
        while (currentY !== end.y) {
            if (this.isValidPosition(currentX, currentY)) {
                if (this.mapData[currentY][currentX].type === MapCellType.WALL) {
                    this.mapData[currentY][currentX].type = MapCellType.CORRIDOR;
                    corridorPath.push({x: currentX, y: currentY});
                }
            }
            currentY += currentY < end.y ? 1 : -1;
        }
        
        // 🚪 在房间入口处放置门
        this.placeDoors(room1, room2, corridorPath);
    }
    
    /**
     * 在房间入口处放置门
     */
    private placeDoors(room1: Room, room2: Room, corridorPath: {x: number, y: number}[]): void {
        // 为房间1找到最近的走廊入口点
        const door1 = this.findRoomEntrance(room1, corridorPath);
        if (door1) {
            this.placeDoor(door1.x, door1.y);
        }
        
        // 为房间2找到最近的走廊入口点
        const door2 = this.findRoomEntrance(room2, corridorPath);
        if (door2) {
            this.placeDoor(door2.x, door2.y);
        }
    }
    
    /**
     * 找到房间的入口点
     */
    private findRoomEntrance(room: Room, corridorPath: {x: number, y: number}[]): {x: number, y: number} | null {
        // 简化逻辑：直接在房间边缘找一个合适的位置放门
        // 检查房间的四条边
        
        // 上边
        for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
            const y = room.y;
            if (this.isValidPosition(x, y - 1) && this.mapData[y - 1][x].type === MapCellType.CORRIDOR) {
                return {x, y};
            }
        }
        
        // 下边
        for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
            const y = room.y + room.height - 1;
            if (this.isValidPosition(x, y + 1) && this.mapData[y + 1][x].type === MapCellType.CORRIDOR) {
                return {x, y};
            }
        }
        
        // 左边
        for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
            const x = room.x;
            if (this.isValidPosition(x - 1, y) && this.mapData[y][x - 1].type === MapCellType.CORRIDOR) {
                return {x, y};
            }
        }
        
        // 右边
        for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
            const x = room.x + room.width - 1;
            if (this.isValidPosition(x + 1, y) && this.mapData[y][x + 1].type === MapCellType.CORRIDOR) {
                return {x, y};
            }
        }
        
        return null;
    }
    
    /**
     * 在指定位置放置门
     */
    private placeDoor(x: number, y: number): void {
        if (this.isValidPosition(x, y)) {
            this.mapData[y][x].type = MapCellType.DOOR;
            console.log(`🚪 在位置 (${x}, ${y}) 放置门`);
        }
    }
    
    /**
     * 放置房间内容
     */
    private placeContent(): void {
        for (const room of this.rooms) {
            switch (room.type) {
                case RoomType.SPAWN:
                    // 出生点
                    const spawnX = room.x + Math.floor(room.width / 2);
                    const spawnY = room.y + Math.floor(room.height / 2);
                    this.mapData[spawnY][spawnX].type = MapCellType.SPAWN;
                    break;
                    
                case RoomType.BOSS:
                    // Boss房间
                    this.placeEnemies(room, 1, true);
                    break;
                    
                case RoomType.NORMAL:
                    // 普通房间随机内容
                    if (Math.random() < 0.6) {
                        this.placeEnemies(room, this.random(1, 3));
                    }
                    if (Math.random() < 0.3) {
                        this.placeTreasure(room);
                    }
                    break;
            }
        }
    }
    
    /**
     * 在房间中放置敌人
     */
    private placeEnemies(room: Room, count: number, isBoss: boolean = false): void {
        for (let i = 0; i < count; i++) {
            const x = room.x + this.random(1, room.width - 1);
            const y = room.y + this.random(1, room.height - 1);
            
            // 添加边界检查
            if (this.isValidPosition(x, y) && this.mapData[y][x].type === MapCellType.FLOOR) {
                this.mapData[y][x].type = MapCellType.ENEMY_SPAWN;
                room.content.push({
                    type: 'enemy',
                    x,
                    y,
                    prefab: isBoss ? 'BossEnemy' : 'NormalEnemy'
                });
            }
        }
    }
    
    /**
     * 在房间中放置宝箱
     */
    private placeTreasure(room: Room): void {
        const x = room.x + this.random(1, room.width - 1);
        const y = room.y + this.random(1, room.height - 1);
        
        // 添加边界检查
        if (this.isValidPosition(x, y) && this.mapData[y][x].type === MapCellType.FLOOR) {
            this.mapData[y][x].type = MapCellType.TREASURE;
            room.content.push({
                type: 'treasure',
                x,
                y,
                prefab: 'TreasureChest'
            });
        }
    }
    
    
    // 工具方法
    
    /**
     * 基于种子的随机数生成
     */
    private random(min: number, max: number): number {
        // 简单的线性同余生成器
        this.currentSeed = (this.currentSeed * 9301 + 49297) % 233280;
        const rnd = this.currentSeed / 233280;
        return Math.floor(min + rnd * (max - min + 1));
    }
    
    /**
     * 计算两个房间之间的距离
     */
    private getDistance(room1: Room, room2: Room): number {
        const center1 = this.getRoomCenter(room1);
        const center2 = this.getRoomCenter(room2);
        
        const dx = center1.x - center2.x;
        const dy = center1.y - center2.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 获取房间中心点
     */
    private getRoomCenter(room: Room): { x: number, y: number } {
        return {
            x: room.x + Math.floor(room.width / 2),
            y: room.y + Math.floor(room.height / 2)
        };
    }
    
    /**
     * 检查位置是否有效
     */
    private isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
    }
    
    /**
     * 获取玩家出生位置
     */
    public getSpawnPosition(): Vec3 {
        const spawnRoom = this.rooms.find(r => r.type === RoomType.SPAWN);
        if (spawnRoom) {
            const center = this.getRoomCenter(spawnRoom);
            return new Vec3(center.x * this.cellSize, center.y * this.cellSize, 0);
        }
        
        return new Vec3(0, 0, 0);
    }
    
    /**
     * 获取房间信息（供其他系统使用）
     */
    public getRooms(): Room[] {
        return [...this.rooms];
    }
    
    /**
     * 获取地图数据（供其他系统使用）
     */
    public getMapData(): MapCell[][] {
        
        return this.mapData;
    }
}

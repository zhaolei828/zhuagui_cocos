import { _decorator, Component, Texture2D, SpriteFrame, Color, Size, Rect } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 纹理生成器 - 用于创建程序化的游戏对象纹理
 * 在没有美术资源时提供可识别的图标
 */
@ccclass('TextureGenerator')
export class TextureGenerator {
    
    /**
     * 检查是否支持Canvas API
     */
    private static isCanvasSupported(): boolean {
        return typeof document !== 'undefined' && 
               typeof HTMLCanvasElement !== 'undefined' &&
               document.createElement('canvas').getContext('2d') !== null;
    }
    
    /**
     * 创建敌人纹理 - 红色圆形，中间有X
     */
    static createEnemyTexture(size: number = 32): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(Color.RED);
        }
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        // 背景透明
        ctx.clearRect(0, 0, size, size);
        
        // 红色圆形背景
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 黑色边框
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 中间画X (表示敌人)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size * 0.3, size * 0.3);
        ctx.lineTo(size * 0.7, size * 0.7);
        ctx.moveTo(size * 0.7, size * 0.3);
        ctx.lineTo(size * 0.3, size * 0.7);
        ctx.stroke();
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 创建宝箱纹理 - 金色方形，中间有$符号
     */
    static createTreasureTexture(size: number = 32): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(Color.YELLOW);
        }
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        // 背景透明
        ctx.clearRect(0, 0, size, size);
        
        // 金色方形背景
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(2, 2, size - 4, size - 4);
        
        // 黑色边框
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        
        // 中间画$符号
        ctx.fillStyle = '#000000';
        ctx.font = `${size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', size / 2, size / 2);
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 创建出生点纹理 - 绿色圆形，中间有房子图标
     */
    static createSpawnTexture(size: number = 32): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(Color.GREEN);
        }
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        // 背景透明
        ctx.clearRect(0, 0, size, size);
        
        // 绿色圆形背景
        ctx.fillStyle = '#44FF44';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 黑色边框
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 画简单的房子图标
        ctx.fillStyle = '#000000';
        // 房子主体
        ctx.fillRect(size * 0.3, size * 0.5, size * 0.4, size * 0.3);
        // 屋顶
        ctx.beginPath();
        ctx.moveTo(size * 0.25, size * 0.5);
        ctx.lineTo(size * 0.5, size * 0.3);
        ctx.lineTo(size * 0.75, size * 0.5);
        ctx.closePath();
        ctx.fill();
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 创建生命值图标 - 红心或空心
     */
    static createHealthTexture(size: number = 24, isEmpty: boolean = false): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(isEmpty ? Color.GRAY : Color.RED);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, size, size);
        
        // 画心形
        const centerX = size / 2;
        const centerY = size / 2;
        const heartSize = size * 0.4;
        
        ctx.fillStyle = isEmpty ? '#666666' : '#FF4444';
        ctx.beginPath();
        
        // 心形路径
        ctx.moveTo(centerX, centerY + heartSize * 0.3);
        ctx.bezierCurveTo(centerX, centerY - heartSize * 0.1, 
                         centerX - heartSize * 0.5, centerY - heartSize * 0.1,
                         centerX - heartSize * 0.5, centerY + heartSize * 0.1);
        ctx.bezierCurveTo(centerX - heartSize * 0.5, centerY + heartSize * 0.4,
                         centerX, centerY + heartSize * 0.7,
                         centerX, centerY + heartSize * 0.7);
        ctx.bezierCurveTo(centerX, centerY + heartSize * 0.7,
                         centerX + heartSize * 0.5, centerY + heartSize * 0.4,
                         centerX + heartSize * 0.5, centerY + heartSize * 0.1);
        ctx.bezierCurveTo(centerX + heartSize * 0.5, centerY - heartSize * 0.1,
                         centerX, centerY - heartSize * 0.1,
                         centerX, centerY + heartSize * 0.3);
        ctx.fill();
        
        if (!isEmpty) {
            // 高光效果
            ctx.fillStyle = '#FF8888';
            ctx.beginPath();
            ctx.ellipse(centerX - heartSize * 0.2, centerY - heartSize * 0.1, 
                       heartSize * 0.15, heartSize * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 创建药水图标
     */
    static createPotionTexture(size: number = 24): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(Color.GREEN);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, size, size);
        
        const centerX = size / 2;
        const centerY = size / 2;
        
        // 瓶身
        ctx.fillStyle = '#44AA44';
        ctx.beginPath();
        ctx.roundRect(centerX - size * 0.25, centerY - size * 0.1, 
                     size * 0.5, size * 0.6, size * 0.1);
        ctx.fill();
        
        // 瓶口
        ctx.fillStyle = '#666666';
        ctx.fillRect(centerX - size * 0.15, centerY - size * 0.4, size * 0.3, size * 0.15);
        
        // 液体
        ctx.fillStyle = '#66FF66';
        ctx.beginPath();
        ctx.roundRect(centerX - size * 0.2, centerY - size * 0.05, 
                     size * 0.4, size * 0.4, size * 0.05);
        ctx.fill();
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 创建武器图标
     */
    static createWeaponTexture(size: number = 24): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(Color.YELLOW);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, size, size);
        
        // 剑身
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(size * 0.45, size * 0.1, size * 0.1, size * 0.6);
        
        // 剑柄
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(size * 0.4, size * 0.7, size * 0.2, size * 0.2);
        
        // 护手
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(size * 0.3, size * 0.65, size * 0.4, size * 0.1);
        
        // 剑尖
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.05);
        ctx.lineTo(size * 0.45, size * 0.15);
        ctx.lineTo(size * 0.55, size * 0.15);
        ctx.closePath();
        ctx.fill();
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 创建护甲图标
     */
    static createArmorTexture(size: number = 24): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(Color.BLUE);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, size, size);
        
        // 盾牌形状
        ctx.fillStyle = '#4444AA';
        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.1);
        ctx.lineTo(size * 0.8, size * 0.3);
        ctx.lineTo(size * 0.8, size * 0.6);
        ctx.lineTo(size * 0.5, size * 0.9);
        ctx.lineTo(size * 0.2, size * 0.6);
        ctx.lineTo(size * 0.2, size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // 边框
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 装饰
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.4, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        return this.canvasToSpriteFrame(canvas);
    }

    /**
     * 创建瓦片纹理 - 根据瓦片类型生成不同样式的方块
     */
    static createTileTexture(tileType: string, size: number = 32): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(this.getTileColor(tileType));
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        ctx.clearRect(0, 0, size, size);
        
        switch (tileType) {
            case 'floor':
                this.drawFloorTile(ctx, size);
                break;
            case 'wall':
                this.drawWallTile(ctx, size);
                break;
            case 'corridor':
                this.drawCorridorTile(ctx, size);
                break;
            case 'door':
                this.drawDoorTile(ctx, size);
                break;
            default:
                this.drawDefaultTile(ctx, size);
        }
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 绘制地板瓦片 - 浅灰色石板效果
     */
    private static drawFloorTile(ctx: CanvasRenderingContext2D, size: number): void {
        // 基础颜色 - 浅灰色
        ctx.fillStyle = '#C8C8C8';
        ctx.fillRect(0, 0, size, size);
        
        // 深色边框
        ctx.strokeStyle = '#A0A0A0';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);
        
        // 添加石板纹理效果
        ctx.fillStyle = '#D0D0D0';
        ctx.fillRect(2, 2, size-4, size-4);
        
        // 内部纹理线条
        ctx.strokeStyle = '#B8B8B8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.8);
        ctx.lineTo(size * 0.8, size * 0.2);
        ctx.stroke();
    }
    
    /**
     * 绘制墙壁瓦片 - 深灰色砖块效果
     */
    private static drawWallTile(ctx: CanvasRenderingContext2D, size: number): void {
        // 基础颜色 - 深灰色
        ctx.fillStyle = '#646464';
        ctx.fillRect(0, 0, size, size);
        
        // 黑色边框
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
        
        // 砖块分割线
        ctx.strokeStyle = '#505050';
        ctx.lineWidth = 1;
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, size * 0.5);
        ctx.lineTo(size, size * 0.5);
        ctx.stroke();
        // 垂直线（错位砖块效果）
        ctx.beginPath();
        ctx.moveTo(size * 0.25, 0);
        ctx.lineTo(size * 0.25, size * 0.5);
        ctx.moveTo(size * 0.75, size * 0.5);
        ctx.lineTo(size * 0.75, size);
        ctx.stroke();
    }
    
    /**
     * 绘制走廊瓦片 - 中灰色过道效果
     */
    private static drawCorridorTile(ctx: CanvasRenderingContext2D, size: number): void {
        // 基础颜色 - 中灰色
        ctx.fillStyle = '#969696';
        ctx.fillRect(0, 0, size, size);
        
        // 边框
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);
        
        // 走廊纹理 - 中央亮一些
        ctx.fillStyle = '#A8A8A8';
        ctx.fillRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);
        
        // 对角线装饰
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, size);
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size);
        ctx.stroke();
    }
    
    /**
     * 绘制门瓦片 - 棕色木门效果
     */
    private static drawDoorTile(ctx: CanvasRenderingContext2D, size: number): void {
        // 基础颜色 - 棕色
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, size, size);
        
        // 深棕色边框
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
        
        // 木门纹理 - 垂直木板
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            const x = (size / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, 2);
            ctx.lineTo(x, size - 2);
            ctx.stroke();
        }
        
        // 门把手
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(size * 0.8, size * 0.5, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // 门把手边框
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * 绘制默认瓦片
     */
    private static drawDefaultTile(ctx: CanvasRenderingContext2D, size: number): void {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);
        
        // 画问号
        ctx.fillStyle = '#000000';
        ctx.font = `${size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', size / 2, size / 2);
    }
    
    /**
     * 获取瓦片类型对应的颜色
     */
    private static getTileColor(tileType: string): Color {
        switch (tileType) {
            case 'floor': return new Color(200, 200, 200, 255);
            case 'wall': return new Color(100, 100, 100, 255);
            case 'corridor': return new Color(150, 150, 150, 255);
            case 'door': return new Color(139, 69, 19, 255);
            default: return Color.WHITE;
        }
    }

    /**
     * 创建Player纹理 - 蓝色圆形，中间有人形图标
     */
    static createPlayerTexture(size: number = 40): SpriteFrame {
        if (!this.isCanvasSupported()) {
            return this.createColoredFallback(Color.BLUE);
        }
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        
        // 背景透明
        ctx.clearRect(0, 0, size, size);
        
        // 蓝色圆形背景
        ctx.fillStyle = '#4444FF';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 白色边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 画简单的人形图标
        ctx.fillStyle = '#FFFFFF';
        // 头
        ctx.beginPath();
        ctx.arc(size / 2, size * 0.35, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        // 身体
        ctx.fillRect(size * 0.45, size * 0.45, size * 0.1, size * 0.25);
        // 手臂
        ctx.fillRect(size * 0.35, size * 0.5, size * 0.3, size * 0.05);
        // 腿
        ctx.fillRect(size * 0.42, size * 0.7, size * 0.06, size * 0.15);
        ctx.fillRect(size * 0.52, size * 0.7, size * 0.06, size * 0.15);
        
        // 🔧 添加方向指示器 - 头顶上方的向上箭头
        ctx.fillStyle = '#FFFF00'; // 黄色箭头，更明显
        ctx.beginPath();
        // 箭头尖端
        ctx.moveTo(size / 2, size * 0.15);
        // 左侧
        ctx.lineTo(size * 0.4, size * 0.25);
        // 箭头中间凹陷
        ctx.lineTo(size * 0.47, size * 0.25);
        ctx.lineTo(size * 0.47, size * 0.3);
        ctx.lineTo(size * 0.53, size * 0.3);
        ctx.lineTo(size * 0.53, size * 0.25);
        // 右侧
        ctx.lineTo(size * 0.6, size * 0.25);
        ctx.closePath();
        ctx.fill();
        
        return this.canvasToSpriteFrame(canvas);
    }
    
    /**
     * 将Canvas转换为SpriteFrame
     */
    private static canvasToSpriteFrame(canvas: HTMLCanvasElement): SpriteFrame {
        try {
            // 获取图像数据
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('❌ 无法获取Canvas context');
                return this.createFallbackSpriteFrame();
            }
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 创建Texture2D
            const texture = new Texture2D();
            texture.reset({
                width: canvas.width,
                height: canvas.height,
                format: Texture2D.PixelFormat.RGBA8888,
            });
            texture.uploadData(imageData.data);
            
            // 创建SpriteFrame
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            spriteFrame.rect = new Rect(0, 0, canvas.width, canvas.height);
            
            return spriteFrame;
            
        } catch (error) {
            console.error('❌ Canvas转SpriteFrame失败:', error);
            return this.createFallbackSpriteFrame();
        }
    }
    
    /**
     * 创建备用的SpriteFrame（纯色方块）
     */
    private static createFallbackSpriteFrame(): SpriteFrame {
        const texture = new Texture2D();
        texture.reset({
            width: 1,
            height: 1,
            format: Texture2D.PixelFormat.RGBA8888,
        });
        const data = new Uint8Array([255, 255, 255, 255]); // 白色
        texture.uploadData(data);
        
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = texture;
        spriteFrame.rect = new Rect(0, 0, 1, 1);
        
        return spriteFrame;
    }
    
    /**
     * 创建指定颜色的备用图标
     */
    private static createColoredFallback(color: Color): SpriteFrame {
        const spriteFrame = this.createFallbackSpriteFrame();
        // 注意：这个SpriteFrame需要在Sprite组件中设置颜色
        return spriteFrame;
    }
}

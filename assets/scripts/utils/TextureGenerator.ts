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

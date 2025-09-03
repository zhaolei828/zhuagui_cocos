import { SpriteFrame, Texture2D, Color, Sprite, ImageAsset } from 'cc';

/**
 * Sprite工具类 - 创建纯色SpriteFrame
 */
export class SpriteUtils {
    private static whiteSpriteFrame: SpriteFrame | null = null;
    
    /**
     * 获取或创建白色SpriteFrame
     */
    public static getWhiteSpriteFrame(): SpriteFrame {
        if (!this.whiteSpriteFrame) {
            this.whiteSpriteFrame = this.createWhiteSpriteFrame();
        }
        return this.whiteSpriteFrame;
    }
    
    /**
     * 创建1x1白色SpriteFrame
     */
    private static createWhiteSpriteFrame(): SpriteFrame {
        // 创建1x1纹理
        const texture = new Texture2D();
        texture.create(1, 1);
        
        // 创建SpriteFrame
        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = texture;
        
        return spriteFrame;
    }
    
    /**
     * 设置Sprite为纯色显示
     */
    public static setColorSprite(sprite: Sprite, color: Color): void {
        // 使用白色SpriteFrame作为基础
        sprite.spriteFrame = this.getWhiteSpriteFrame();
        sprite.color = color;
        
        console.log(`🎨 设置Sprite颜色: r=${color.r} g=${color.g} b=${color.b}`);
    }
}

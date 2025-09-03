import { Vec2, Vec3 } from 'cc';

/**
 * 数学工具类
 * 提供常用的数学计算功能
 */
export class MathUtils {
    
    /**
     * 线性插值
     * @param a 起始值
     * @param b 结束值
     * @param t 插值参数 (0-1)
     */
    public static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /**
     * 限制数值在指定范围内
     * @param value 要限制的值
     * @param min 最小值
     * @param max 最大值
     */
    public static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * 生成指定范围内的随机整数
     * @param min 最小值
     * @param max 最大值
     */
    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 生成指定范围内的随机浮点数
     * @param min 最小值
     * @param max 最大值
     */
    public static randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * 计算两个向量之间的距离
     * @param v1 向量1
     * @param v2 向量2
     */
    public static distance(v1: Vec2 | Vec3, v2: Vec2 | Vec3): number {
        if (v1 instanceof Vec2 && v2 instanceof Vec2) {
            return Vec2.distance(v1, v2);
        } else if (v1 instanceof Vec3 && v2 instanceof Vec3) {
            return Vec3.distance(v1, v2);
        }
        return 0;
    }

    /**
     * 角度转弧度
     * @param degrees 角度值
     */
    public static degreesToRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    /**
     * 弧度转角度
     * @param radians 弧度值
     */
    public static radiansToDegrees(radians: number): number {
        return radians * 180 / Math.PI;
    }
}

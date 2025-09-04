import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 音频类型
 */
enum AudioType {
    BGM = 'bgm',
    SFX = 'sfx'
}

/**
 * 音频管理器
 */
@ccclass('AudioManager')
export class AudioManager extends Component {
    
    @property({ type: AudioSource, tooltip: "背景音乐播放器" })
    bgmAudioSource: AudioSource = null!;
    
    @property({ type: AudioSource, tooltip: "音效播放器" })
    sfxAudioSource: AudioSource = null!;
    
    @property({ type: [AudioClip], tooltip: "背景音乐列表" })
    bgmClips: AudioClip[] = [];
    
    @property({ type: [AudioClip], tooltip: "音效列表" })
    sfxClips: AudioClip[] = [];
    
    @property({ tooltip: "背景音乐音量", range: [0, 1, 0.01] })
    bgmVolume: number = 0.5;
    
    @property({ tooltip: "音效音量", range: [0, 1, 0.01] })
    sfxVolume: number = 0.7;
    
    @property({ tooltip: "是否启用音频" })
    audioEnabled: boolean = true;
    
    // 音效映射
    private sfxMap: Map<string, AudioClip> = new Map();
    private bgmMap: Map<string, AudioClip> = new Map();
    
    // 当前播放的BGM
    private currentBGM: string = '';
    
    // 单例实例
    private static instance: AudioManager;
    
    public static getInstance(): AudioManager {
        return AudioManager.instance;
    }
    
    start() {
        // 设置单例
        AudioManager.instance = this;
        
        // 初始化音频映射
        this.initializeAudioMaps();
        
        // 设置初始音量
        this.updateVolume();
        
        console.log('🎵 音频管理器初始化完成');
    }
    
    /**
     * 初始化音频映射
     */
    private initializeAudioMaps(): void {
        // 映射背景音乐
        this.bgmClips.forEach(clip => {
            if (clip) {
                this.bgmMap.set(clip.name, clip);
            }
        });
        
        // 映射音效
        this.sfxClips.forEach(clip => {
            if (clip) {
                this.sfxMap.set(clip.name, clip);
            }
        });
        
        console.log(`🎵 加载了 ${this.bgmMap.size} 个BGM, ${this.sfxMap.size} 个音效`);
    }
    
    /**
     * 播放背景音乐
     */
    playBGM(bgmName: string, loop: boolean = true): void {
        if (!this.audioEnabled || !this.bgmAudioSource) return;
        
        const clip = this.bgmMap.get(bgmName);
        if (!clip) {
            console.warn(`🎵 未找到背景音乐: ${bgmName}`);
            return;
        }
        
        // 如果已经在播放相同的BGM，不重复播放
        if (this.currentBGM === bgmName && this.bgmAudioSource.playing) {
            return;
        }
        
        this.bgmAudioSource.stop();
        this.bgmAudioSource.clip = clip;
        this.bgmAudioSource.loop = loop;
        this.bgmAudioSource.play();
        this.currentBGM = bgmName;
        
        console.log(`🎵 播放背景音乐: ${bgmName}`);
    }
    
    /**
     * 停止背景音乐
     */
    stopBGM(): void {
        if (this.bgmAudioSource) {
            this.bgmAudioSource.stop();
            this.currentBGM = '';
        }
    }
    
    /**
     * 暂停背景音乐
     */
    pauseBGM(): void {
        if (this.bgmAudioSource && this.bgmAudioSource.playing) {
            this.bgmAudioSource.pause();
        }
    }
    
    /**
     * 恢复背景音乐
     */
    resumeBGM(): void {
        if (this.bgmAudioSource) {
            this.bgmAudioSource.play();
        }
    }
    
    /**
     * 播放音效
     */
    playSFX(sfxName: string, volume?: number): void {
        if (!this.audioEnabled || !this.sfxAudioSource) return;
        
        const clip = this.sfxMap.get(sfxName);
        if (!clip) {
            console.warn(`🔊 未找到音效: ${sfxName}`);
            return;
        }
        
        // 设置音量（如果指定）
        const originalVolume = this.sfxAudioSource.volume;
        if (volume !== undefined) {
            this.sfxAudioSource.volume = volume * this.sfxVolume;
        }
        
        this.sfxAudioSource.playOneShot(clip);
        
        // 恢复原音量
        if (volume !== undefined) {
            this.scheduleOnce(() => {
                this.sfxAudioSource.volume = originalVolume;
            }, 0.1);
        }
        
        console.log(`🔊 播放音效: ${sfxName}`);
    }
    
    /**
     * 设置背景音乐音量
     */
    setBGMVolume(volume: number): void {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmAudioSource) {
            this.bgmAudioSource.volume = this.bgmVolume;
        }
    }
    
    /**
     * 设置音效音量
     */
    setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxAudioSource) {
            this.sfxAudioSource.volume = this.sfxVolume;
        }
    }
    
    /**
     * 切换音频开关
     */
    toggleAudio(): void {
        this.audioEnabled = !this.audioEnabled;
        
        if (!this.audioEnabled) {
            this.stopBGM();
        } else if (this.currentBGM) {
            this.playBGM(this.currentBGM);
        }
        
        console.log(`🎵 音频 ${this.audioEnabled ? '开启' : '关闭'}`);
    }
    
    /**
     * 更新音量设置
     */
    private updateVolume(): void {
        if (this.bgmAudioSource) {
            this.bgmAudioSource.volume = this.bgmVolume;
        }
        if (this.sfxAudioSource) {
            this.sfxAudioSource.volume = this.sfxVolume;
        }
    }
    
    /**
     * 预加载音频
     */
    preloadAudio(): void {
        // 预加载所有音频资源
        console.log('🎵 预加载音频资源...');
        
        // 这里可以添加音频预加载逻辑
        // 例如：提前解码音频文件等
    }
    
    /**
     * 获取当前播放状态
     */
    getPlaybackInfo(): { bgm: string, bgmPlaying: boolean, sfxEnabled: boolean } {
        return {
            bgm: this.currentBGM,
            bgmPlaying: this.bgmAudioSource ? this.bgmAudioSource.playing : false,
            sfxEnabled: this.audioEnabled
        };
    }
    
    /**
     * 静态方法：播放音效（方便其他类调用）
     */
    static playSFX(sfxName: string, volume?: number): void {
        const instance = AudioManager.getInstance();
        if (instance) {
            instance.playSFX(sfxName, volume);
        }
    }
    
    /**
     * 静态方法：播放背景音乐（方便其他类调用）
     */
    static playBGM(bgmName: string, loop: boolean = true): void {
        const instance = AudioManager.getInstance();
        if (instance) {
            instance.playBGM(bgmName, loop);
        }
    }
}

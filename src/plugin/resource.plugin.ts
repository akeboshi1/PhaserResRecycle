export enum ResType {
    image = "image",
    binary = "binary",
    animationJSON = "animationJSON",
    sprite = "sprite",
    audio = "audio",
    json = "json",
    video = "video",
    atlas = "atlas",
    tilemap = "tilemapTiledJSON",
    script = "script",
}
/**
 * 默认销毁时间，5分钟之内资源没有被使用过，直接销毁，默认静态资源不会清理
 */
export const ResDisposeTime = 100000;
/**
 * 默认资源检测时间30scheck一次
 */
export const ResCheckTime = 30000;

export const ResourcePluginKey: string = "ResourcePluginKey";

export class ResourcePlugin extends Phaser.Plugins.ScenePlugin {
    private _checkTime: number = 0;

    private _checkEvent: any;

    private _checkTimeEvent: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
        super(scene, pluginManager, ResourcePluginKey);
        this._checkEvent = { delay: this._checkTime, loop: true, callback: this.checkRes, callbackScope: this };
    }

    get checkTime(): number {
        return this._checkTime;
    }

    set checkTime(val: number) {
        this._checkTime = val;
    }

    /**
     * 初始化
     * @param time 设置资源销毁的时间(单位：毫秒)，至少大于检查时间 `30秒`
     */
    init(time: number = ResCheckTime) {
        if (time !== ResCheckTime) {
            this.checkTime = time;
        }
        // 暂时用scene tick，后续用woker的tick
        if (!this._checkTimeEvent) this._checkTimeEvent = this.scene.time.addEvent(this._checkEvent);
    }

    reset() {
        if (this._checkTimeEvent) {
            this._checkTimeEvent.remove();
            this._checkTimeEvent = null;
        }
        this._checkTimeEvent = this.scene.time.addEvent(this._checkEvent);
    }

    clear() {
        // 还没想好清理render各个管理器缓存时，本地资源管理器是否要做其他操作
    }

    destroy() {
        if (this._checkTimeEvent) this._checkTimeEvent.destroy();
        this._checkTimeEvent = null;
    }

    private checkRes() {
        if (!this.scene.load) return;
        // @ts-ignore
        this.scene.load.checkResDestroyTime();
    }
}

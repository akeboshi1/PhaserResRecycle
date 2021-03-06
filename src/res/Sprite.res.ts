import { ResType } from "../plugin/resource.plugin";
import { IResource, ResState } from "./IResource";
export class SpriteRes implements IResource {
    public key: string;
    public url: string;
    public altasUrl: string;
    public resType: string = ResType.sprite;
    public lastUseTime: number;
    public state: number = ResState.None;

    /**
     * 绑定列表
     */
    private _list = [];

    private _isStatic = false;

    constructor(key: string, url: string, altasUrl: string) {
        this.key = key;
        this.url = url;
        this.altasUrl = altasUrl;
    }

    get isStatic(): boolean {
        if (this._isStatic) return this._isStatic;
        return this._list.length > 0;
    }

    set isStatic(val) {
        this._isStatic = val;
    }

    /**
     * 绑定对象
     * @param img
     */
    bind(img: Phaser.GameObjects.GameObject) {
        this._list.push(img);
        this.lastUseTime = Date.now();
    }

    /**
     * 解绑对象
     * @param img
     */
    loose(img: Phaser.GameObjects.GameObject) {
        const index = this._list.indexOf(img);
        if (index > -1) this._list.splice(index, 1);
        this.lastUseTime = Date.now();
    }

    dispose() {
        this.lastUseTime = Date.now();
        this._list.length = 0;
    }
}

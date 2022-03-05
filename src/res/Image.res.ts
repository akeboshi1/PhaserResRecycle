import { ResType } from "../plugin/resource.plugin";
import { IResource, ResState } from "./IResource";
export class ImageRes implements IResource {
    public key: string;
    public url: string;
    public resType: string = ResType.image;
    public lastUseTime: number;
    public state: number = ResState.None;

    /**
     * 绑定列表
     */
    private _list = [];

    private _isStatic = false;

    constructor(key: string, url: string) {
        this.key = key;
        this.url = url;
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
    public bind(img: Phaser.GameObjects.Image) {
        this._list.push(img);
        this.lastUseTime = Date.now();
    }

    /**
     * 解绑对象
     * @param img
     */
    public loose(img: Phaser.GameObjects.Image) {
        const index = this._list.indexOf(img);
        if (index > -1) this._list.splice(index, 1);
        this.lastUseTime = Date.now();
    }

    public dispose() {
        this.lastUseTime = Date.now();
        this._list.length = 0;
    }
}

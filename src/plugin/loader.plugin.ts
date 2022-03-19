import { SpriteRes } from "./../res/Sprite.res";
import { ImageRes } from "../res/Image.res";
import { ResDisposeTime, ResType } from "./resource.plugin";
import { IResource, ResState } from "../res/IResource";

export class LoaderPlugin extends Phaser.Loader.LoaderPlugin {
    /**
     * 被销毁的资源缓存，用于后续二次加载
     */
    private _disposeDic: Map<string, IResource>;
    /**
     * 当前被使用资源的缓存
     */
    private _loadDic: Map<string, IResource>;
    constructor(scene: Phaser.Scene) {
        super(scene);
        this._loadDic = new Map();
        this._disposeDic = new Map();
    }

    /**
     * @method Phaser.Loader.LoaderPlugin#get
     * @param key
     * @return {*}
     */
    get(key: string) {
        return this._loadDic.get(key);
    }

    /**
     * @method Phaser.Loader.LoaderPlugin#getSize
     * @param url
     * @return {number}
     */
    getSize(): number {
        return this._loadDic.size;
    }

    /**
     * @method Phaser.Loader.LoaderPlugin#checkResDestroyTime
     * @param expire
     */
    checkResDestroyTime() {
        const now = Date.now();
        this._loadDic.forEach((res) => {
            if (!res.isStatic &&( now - res.lastUseTime > ResDisposeTime || res.state === ResState.PreDispose)) {
                this.remove(res);
            }
        });
    }

    /**
     * 重新加载已经被删除的资源
     * @param key
     * @returns
     */
    reload(key): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const res = this._disposeDic.get(key);
            if (!res) reject("key为:"+`${key}`+"的资源没有被加载过");
            this._disposeDic.delete(key);
            const fun = (resKey): string => {
                this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE);
                return resKey;
            };
            this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, (resKey) => {
                if (resKey === key) {
                    resolve(fun(resKey));
                }
            }, this);
            const type = res.resType;
            switch (type) {
                case ResType.image:
                    this.scene.load.image(res.key, res.url);
                    break;
                case ResType.sprite:
                    this.scene.load.atlas(res.key, res.url, (<SpriteRes>res).altasUrl);
                    break;
            }
            this.scene.load.start();
        });
    }

    /**
     * @method Phaser.Loader.LoaderPlugin#remove
     * @param res
     *
     */
    remove(res: IResource) {
        const key = res.key;
        const type = res.resType;
        let removeRes;
        switch (type) {
            case ResType.animationJSON:
                break;
            case ResType.script:
                break;
            case ResType.sprite:
                this.checkImage(key);
                break;
            case ResType.atlas:
                this.checkImage(key);
                // todo json
                break;
            case ResType.audio:
                removeRes = this.scene.cache.audio.get(key);
                if (removeRes) this.scene.game.cache.audio.remove(removeRes);
                break;
            case ResType.binary:
                removeRes = this.scene.cache.binary.get(key);
                if (removeRes) this.scene.game.cache.binary.remove(removeRes);
                break;
            case ResType.image:
                this.checkImage(key);
                break;
            case ResType.json:
                removeRes = this.scene.cache.json.get(key);
                if (removeRes) this.scene.game.cache.json.remove(key);
                break;
            case ResType.tilemap:
                removeRes = this.scene.cache.tilemap.get(key);
                if (removeRes) this.scene.cache.tilemap.remove(removeRes);
                break;
            case ResType.video:
                removeRes = this.scene.cache.video.get(key);
                if (removeRes) this.scene.game.cache.video.remove(key);
                break;
            default:
                break;
        }
        const _res = this._loadDic.get(key);
        if (!_res) return;
        this._disposeDic.set(key, _res);
        this._loadDic.delete(key);
    }

    checkImage(key: string): boolean {
        const removeRes: any = this.scene.textures.get(key);
        if (removeRes && (removeRes.key !== "__DEFAULT" && removeRes.key !== "__MISSING") && !removeRes.useCount) {
            this.scene.anims.removeByTextureKey(removeRes.key);
            this.scene.game.textures.remove(removeRes);
            // @ts-ignore
            this.scene.showTxt("removeRes.key:" + removeRes.key);
            console.warn(`${removeRes.key}被销毁`);
            return true;
        }
        return false;
    }

    /**
     * Adds a file, or array of files, into the load queue.
     *
     * The file must be an instance of `Phaser.Loader.File`, or a class that extends it. The Loader will check that the key
     * used by the file won"t conflict with any other key either in the loader, the inflight queue or the target cache.
     * If allowed it will then add the file into the pending list, read for the load to start. Or, if the load has already
     * started, ready for the next batch of files to be pulled from the list to the inflight queue.
     *
     * You should not normally call this method directly, but rather use one of the Loader methods like `image` or `atlas`,
     * however you can call this as long as the file given to it is well formed.
     *
     * @method Phaser.Loader.LoaderPlugin#addFile
     * @fires Phaser.Loader.Events#ADD
     * @since 3.0.0
     *
     * @param {(Phaser.Loader.File|Phaser.Loader.File[])} file - The file, or array of files, to be added to the load queue.
     */
    addFile(file) {
        if (!Array.isArray(file)) {
            file = [file];
        }

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < file.length; i++) {
            const item = file[i];

            //  Does the file already exist in the cache or texture manager?
            //  Or will it conflict with a file already in the queue or inflight?
            if (!this.keyExists(item)) {
                this.list.set(item);
                // 资源准备加载
                this.changeResState(item.key, ResState.PreLoad);
                this.emit(Phaser.Loader.Events.ADD, item.key, item.type, this, item);
                if (this.isLoading()) {
                    this.totalToLoad++;
                    this.updateProgress();
                }
            }
        }
    }

    /**
     * @method Phaser.Loader.LoaderPlugin#changeResState
     * @param key
     * @param state
     */
    changeResState(key: string, state: number) {
        const res = this._loadDic.get(key);
        if (res && res.state !== state) res.state = state;
    }

    /**
     * An internal method called by the Loader.
     *
     * It will check to see if there are any more files in the pending list that need loading, and if so it will move
     * them from the list Set into the inflight Set, set their CORs flag and start them loading.
     *
     * It will carrying on doing this for each file in the pending list until it runs out, or hits the max allowed parallel downloads.
     *
     * @method Phaser.Loader.LoaderPlugin#checkLoadQueue
     * @private
     * @since 3.7.0
     */
    checkLoadQueue() {
        this.list.each((file) => {
            if (file.state === Phaser.Loader.FILE_POPULATED || (file.state === Phaser.Loader.FILE_PENDING && this.inflight.size < this.maxParallelDownloads)) {
                this.inflight.set(file);

                this.list.delete(file);

                //  If the file doesn"t have its own crossOrigin set, we"ll use the Loaders (which is undefined by default)
                if (!file.crossOrigin) {
                    file.crossOrigin = this.crossOrigin;
                }

                file.load();
                this.changeResState(file.key, ResState.Loading);
            }

            if (this.inflight.size === this.maxParallelDownloads) {
                //  Tells the Set iterator to abort
                return false;
            }

        });
    }

    /**
     * An internal method called automatically by the XHRLoader belong to a File.
     *
     * This method will remove the given file from the inflight Set and update the load progress.
     * If the file was successful its `onProcess` method is called, otherwise it is added to the delete queue.
     *
     * @method Phaser.Loader.LoaderPlugin#nextFile
     * @fires Phaser.Loader.Events#FILE_LOAD
     * @fires Phaser.Loader.Events#FILE_LOAD_ERROR
     * @since 3.0.0
     *
     * @param {Phaser.Loader.File} file - The File that just finished loading, or errored during load.
     * @param {boolean} success - `true` if the file loaded successfully, otherwise `false`.
     */
    nextFile(file, success) {
        //  Has the game been destroyed during load? If so, bail out now.
        if (!this.inflight) {
            return;
        }

        this.inflight.delete(file);

        this.updateProgress();
        const key = file.key;
        if (success) {
            this.totalComplete++;

            this.queue.set(file);

            this.changeResState(key, ResState.LoadComplete);

            this.emit(Phaser.Loader.Events.FILE_LOAD, file);

            file.onProcess();
        } else {
            this.totalFailed++;

            this["_deleteQueue"].set(file);

            this.changeResState(key, ResState.LoadError);

            this.emit(Phaser.Loader.Events.FILE_LOAD_ERROR, file);

            this.fileProcessComplete(file);
        }
    }

    /**
     * The Scene that owns this plugin is being destroyed.
     * We need to shutdown and then kill off all external references.
     *
     * @method Phaser.Loader.LoaderPlugin#destroy
     * @private
     * @since 3.0.0
     */
    destroy() {
        this._loadDic.forEach((res: IResource) => {
            res.state = ResState.PreDispose;
        });
        super.destroy();
        this._loadDic = null;
    }
}

/**
 * @method Phaser.Loader.LoaderPlugin#image
 * @fires Phaser.Loader.LoaderPlugin#ADD
 * @since 3.0.0
 *
 * @param {(string|Phaser.Types.Loader.FileTypes.ImageFileConfig|Phaser.Types.Loader.FileTypes.ImageFileConfig[])} key - The key to use for this file, or a file configuration object, or array of them.
 * @param {string|string[]} [url] - The absolute or relative URL to load this file from. If undefined or `null` it will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
 * @param {boolean} [isStatic] - 是否是静态资源
 * @param {Phaser.Types.Loader.XHRSettingsObject} [xhrSettings] - An XHR Settings configuration object. Used in replacement of the Loaders default XHR Settings.
 *
 * @return {this} The Loader instance.
 */
Phaser.Loader.FileTypesManager.register("image", function(key, url, isStatic, xhrSettings) {
    if (Array.isArray(key)) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < key.length; i++) {
            //  If it"s an array it has to be an array of Objects, so we get everything out of the "key" object
            this.addFile(new Phaser.Loader.FileTypes.ImageFile(this, key[i]));
        }
    } else {
        this.addFile(new Phaser.Loader.FileTypes.ImageFile(this, key, url, xhrSettings));
    }
    const _isStatic = isStatic || false;
    const _key = String(key);
    const _url = String(url);
    let res: ImageRes = this._loadDic.get(_key);
    if (!res) {
        res = new ImageRes(_key, _url);
        res.isStatic = _isStatic;
        this._loadDic.set(_key, res);
    } else {
        if(_isStatic)res.isStatic = _isStatic;
    }
    res.lastUseTime = Date.now();
    return this;
});

/**
 * @method Phaser.Loader.LoaderPlugin#atlas
 * @fires Phaser.Loader.LoaderPlugin#ADD
 * @since 3.0.0
 *
 * @param {(string|Phaser.Types.Loader.FileTypes.AtlasJSONFileConfig|Phaser.Types.Loader.FileTypes.AtlasJSONFileConfig[])} key - The key to use for this file, or a file configuration object, or array of them.
 * @param {string|string[]} [textureURL] - The absolute or relative URL to load the texture image file from. If undefined or `null` it will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
 * @param {object|string} [atlasURL] - The absolute or relative URL to load the texture atlas json data file from. If undefined or `null` it will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.json". Or, a well formed JSON object.
 * @param {boolean} [isStatic] - 是否是静态资源
 * @param {Phaser.Types.Loader.XHRSettingsObject} [textureXhrSettings] - An XHR Settings configuration object for the atlas image file. Used in replacement of the Loaders default XHR Settings.
 * @param {Phaser.Types.Loader.XHRSettingsObject} [atlasXhrSettings] - An XHR Settings configuration object for the atlas json file. Used in replacement of the Loaders default XHR Settings.
 *
 * @return {this} The Loader instance.
 */
Phaser.Loader.FileTypesManager.register("atlas", function(key, textureURL, atlasURL, isStatic: boolean, textureXhrSettings, atlasXhrSettings) {
    let multifile;

    //  Supports an Object file definition in the key argument
    //  Or an array of objects in the key argument
    //  Or a single entry where all arguments have been defined

    if (Array.isArray(key)) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < key.length; i++) {
            multifile = new Phaser.Loader.FileTypes.AtlasJSONFile(this, key[i]);

            this.addFile(multifile.files);
        }
    } else {
        multifile = new Phaser.Loader.FileTypes.AtlasJSONFile(this, key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings);

        this.addFile(multifile.files);
    }
    const _isStatic = isStatic || false;

    const _key = String(key);
    const _url = String(textureURL);
    const _atlasUrl = String(atlasURL);
    let res: IResource = this._loadDic.get(_key);
    if (!res) {
        // res = new ImageRes(_key, _url);
        res = new SpriteRes(_key, _url, _atlasUrl);
        res.isStatic = _isStatic;
        this._loadDic.set(_key, res);
    } else {
        if(_isStatic)res.isStatic = _isStatic;
    }
    res.lastUseTime = Date.now();
    return this;
});

/**
 * @method Phaser.Loader.LoaderPlugin#spritesheet
 * @fires Phaser.Loader.LoaderPlugin#ADD
 * @since 3.0.0
 *
 * @param {(string|Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig|Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig[])} key - The key to use for this file, or a file configuration object, or array of them.
 * @param {string} [url] - The absolute or relative URL to load this file from. If undefined or `null` it will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
 * @param {boolean} [isStatic] - 是否是静态资源
 * @param {Phaser.Types.Loader.FileTypes.ImageFrameConfig} [frameConfig] - The frame configuration object. At a minimum it should have a `frameWidth` property.
 * @param {Phaser.Types.Loader.XHRSettingsObject} [xhrSettings] - An XHR Settings configuration object. Used in replacement of the Loaders default XHR Settings.
 *
 * @return {this} The Loader instance.
 */
Phaser.Loader.FileTypesManager.register("spritesheet", function(key, url, isStatic, frameConfig, xhrSettings) {
    if (Array.isArray(key)) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < key.length; i++) {
            //  If it"s an array it has to be an array of Objects, so we get everything out of the "key" object
            this.addFile(new Phaser.Loader.FileTypes.SpriteSheetFile(this, key[i]));
        }
    } else {
        this.addFile(new Phaser.Loader.FileTypes.SpriteSheetFile(this, key, url, frameConfig, xhrSettings));
    }

    const _isStatic = isStatic || false;

    const _key = String(key);
    const _url = String(url);
    let res: ImageRes = this._loadDic.get(_key);
    if (!res) {
        res = new ImageRes(_key, _url);
        res.isStatic = _isStatic;
        this._loadDic.set(_key, res);
    } else {
        if(_isStatic)res.isStatic = _isStatic;
    }
    res.lastUseTime = Date.now();
    return this;
});

Phaser.Plugins.PluginCache.register("Loader", LoaderPlugin, "load");

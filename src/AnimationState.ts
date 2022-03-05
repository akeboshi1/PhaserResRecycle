import { ObjectUtils } from "./object.utils";
import { SheetSprite } from "./sheet.sprite";

const GetFastValue = Phaser.Utils.Objects.GetFastValue;
export class AnimationState extends Phaser.Animations.AnimationState {
    /**
     * 默认资源key，不参与资源管理
     */
    private _defaultKey: string = "__DEFAULTSPRITE";
    private _hasBind: boolean = false;
    constructor(parent: Phaser.GameObjects.GameObject) {
        super(parent);
        this.bindTexture();
    }

    get defaultKey(): string {
        return this._defaultKey;
    }

    set defaultKey(val: string) {
        this._defaultKey = val;
    }

    /**
     * Internal method used to load an animation into this component.
     *
     * @method Phaser.Animations.AnimationState#setAnimation
     * @protected
     * @since 3.0.0
     *
     * @param {(string|Phaser.Types.Animations.PlayAnimationConfig)} key - The string-based key of the animation to play, or a `PlayAnimationConfig` object.
     *
     * @return {Phaser.GameObjects.GameObject} The Game Object that owns this Animation Component.
     */
    setAnimation(key) {
        return this.load(key);
    }

    load(key) {
        if (this.isPlaying) {
            this.stop();
        }

        const manager = this.animationManager;
        const animKey = (typeof key === "string") ? key : GetFastValue(key, "key", null);

        //  Get the animation, first from the local map and, if not found, from the Animation Manager
        let anim;
        if (!this.exists(animKey)) {
            if (!this._hasBind) this.bindTexture();
            anim = manager.get(animKey);
        } else {
            anim = this.get(animKey);
        }
        // anim = (this.exists(animKey)) ? this.get(animKey) : manager.get(animKey);

        const fun = () => {
            this.currentAnim = anim;

            //  And now override the animation values, if set in the config.

            const totalFrames = anim.getTotalFrames();
            const frameRate = GetFastValue(key, "frameRate", anim.frameRate);
            const duration = GetFastValue(key, "duration", anim.duration);

            anim.calculateDuration(this, totalFrames, duration, frameRate);

            this.delay = GetFastValue(key, "delay", anim.delay);
            this.repeat = GetFastValue(key, "repeat", anim.repeat);
            this.repeatDelay = GetFastValue(key, "repeatDelay", anim.repeatDelay);
            this.yoyo = GetFastValue(key, "yoyo", anim.yoyo);
            this.showOnStart = GetFastValue(key, "showOnStart", anim.showOnStart);
            this.hideOnComplete = GetFastValue(key, "hideOnComplete", anim.hideOnComplete);
            this.skipMissedFrames = GetFastValue(key, "skipMissedFrames", anim.skipMissedFrames);

            this.timeScale = GetFastValue(key, "timeScale", this.timeScale);

            let startFrame = GetFastValue(key, "startFrame", 0);

            if (startFrame > anim.getTotalFrames()) {
                startFrame = 0;
            }

            let frame = anim.frames[startFrame];

            if (startFrame === 0 && !this.forward) {
                frame = anim.getLastFrame();
            }

            this.currentFrame = frame;
        };
        if (!anim) {
            console.warn("Missing animation: " + animKey);
            // get default sprite
            anim = manager.get(this._defaultKey);
            // 获取不到scene，所以不在animationState中加载对应的sprite资源
            fun();
        } else {
            fun();
        }
        return this.parent;
    }

    destroy(): void {
        this.looseTexture();
        super.destroy();
    }

    private bindTexture() {
        const sheetSprite: SheetSprite = <SheetSprite>this.parent;
        const textureKey = sheetSprite.texture.key;
        if (!textureKey || textureKey === "__MISSING" || textureKey === "__DEFAULT") return;
        const scene = sheetSprite.scene;
        const texture = scene.textures.get(textureKey);
        if (!ObjectUtils.hasOwnProperty(texture, "useConut")) {
            ObjectUtils.defineProperty(texture, {
                useCount: {
                    value: 0,
                    writable: true
                }
            });
        }
        this._hasBind = true;
        // @ts-ignore
        texture.useCount++;
    }

    private looseTexture() {
        const sheetSprite: SheetSprite = <SheetSprite>this.parent;
        const textureKey = sheetSprite.texture.key;
        const scene = sheetSprite.scene;
        const texture = scene.textures.get(textureKey);
        if (!ObjectUtils.hasOwnProperty(texture, "useConut")) {
            ObjectUtils.defineProperty(texture, {
                useCount: {
                    value: 0,
                    writable: true
                }
            });
        }
        this._hasBind = false;
        // @ts-ignore
        texture.useCount--;
    }
}

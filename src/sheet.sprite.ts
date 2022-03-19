import "phaser3";
import { AnimationState } from "./AnimationState";
import { ObjectUtils } from "./object.utils";
import { SpriteRes } from "./res/Sprite.res";
export class SheetSprite extends Phaser.GameObjects.Sprite {
    /**
     * 默认动画key
     */
    private _defaultAnimationKey: string = "__DEFAULTANIMATION";
    /**
     * 动画的key
     */
    private _animationKey: string | Phaser.Animations.Animation | Phaser.Types.Animations.PlayAnimationConfig;
    constructor(scene: Phaser.Scene, x: number, y: number, key: string | Phaser.Textures.Texture, frame?: string | number, defaultAnimationKey?: string) {
        super(scene, x, y, key, frame);
        this.anims = new AnimationState(this);
        // 添加默认动画资源
        if (defaultAnimationKey) this._defaultAnimationKey = defaultAnimationKey;
        if (!ObjectUtils.hasOwnProperty(this, "hasBind")) {
            ObjectUtils.defineProperty(this, {
                hasBind: {
                    value: false,
                    writable: true
                }
            });
        }
        if (!ObjectUtils.hasOwnProperty(this, "textureKey")) {
            ObjectUtils.defineProperty(this, {
                textureKey: {
                    value: null,
                    writable: true
                }
            });
        }
    }

    get animationKey() {
        return this._animationKey || this._defaultAnimationKey;
    }

    set animationKey(val) {
        this._animationKey = val;
    }

    setAnimation(animationKey: string, textureKey: string) {
        this.animationKey = animationKey;
        // @ts-ignore
        if (this.anims) this.anims.setAnimation(animationKey, textureKey);
    }

    bind(key: string) {
        if (!key) return;
        if (!ObjectUtils.hasOwnProperty(this.texture, "useCount")) {
            ObjectUtils.defineProperty(this.texture, {
                useCount: {
                    value: 0,
                    writable: true
                }
            });
        }
        // @ts-ignore
        const res: SpriteRes = this.scene.load.get(key);
        if (res) {
            // @ts-ignore
            this.textureKey = key;
            // @ts-ignore
            this.hasBind = true;
            // @ts-ignore
            if (this.texture) this.texture.useCount++;
            res.bind(this);
        }
    }

    loose(key: string) {
        if (!key) return;
        // @ts-ignore
        const res: SpriteRes = this.scene.load.get(key);
        if (res) {
            // @ts-ignore
            this.hasBind = false;
            // @ts-ignore
            if (this.texture) this.texture.useCount--;
            res.loose(this);
        }
    }

    play(key: string | Phaser.Animations.Animation | Phaser.Types.Animations.PlayAnimationConfig, ignoreIfPlaying: boolean = false): this {
        // 当sprite还没有被完全销毁时，就被再次调用
        if (!this.anims) return;
        let _tmpKey;
        // @ts-ignore
        if (!this.anims.getAnimation(key) || !this.texture || this.texture.key === "__MISSING") {
            _tmpKey = this._defaultAnimationKey;
        } else {
            _tmpKey = key;
        }
        this.animationKey = key;
        if (!this.scene.anims.get(_tmpKey)) return this;
        return super.play(_tmpKey, ignoreIfPlaying);
    }

    setTexture(key: string, frame?: string | number): this {
        super.setTexture(key, frame);
        // @ts-ignore
        if (!this.hasBind) {
            this.bind(key);
        }
        return this;
    }

    destroy(fromScene?: boolean): void {
        // @ts-ignore
        if (this.textureKey && this.hasBind) {
            let key;
            // @ts-ignore
            if (typeof (this.textureKey) === "string") {
                // @ts-ignore
                key = this.textureKey;
            } else {
                // @ts-ignore
                key = (<Phaser.Textures.Texture>this.textureKey).key;
            }
            this.loose(key);
        }
        super.destroy(fromScene);
    }
}

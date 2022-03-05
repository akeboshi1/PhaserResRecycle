import "phaser3";
import { AnimationState } from "./AnimationState";
import { ObjectUtils } from "./object.utils";

export class SheetSprite extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, key: string | Phaser.Textures.Texture, frame?: string | number) {
        super(scene, x, y, key, frame);
        this.anims = new AnimationState(this);
        ObjectUtils.defineProperty(this, {
            hasBind: {
                value: false,
                writable: true
            },
            tmpKey: {
                value: null,
                writable: true
            }
        });
    }

    setAnimation(key) {
        // @ts-ignore
        if (this.anims) this.anims.setAnimation(key);
    }

    bind(key: string) {
        if (!key) return;
        if (!ObjectUtils.hasOwnProperty(this.texture, "useConut")) {
            ObjectUtils.defineProperty(this.texture, {
                useCount: {
                    value: 0,
                    writable: true
                }
            });
        }
        // @ts-ignore
        const res: ImageRes = this.scene.load.get(key);
        if (res) {
            // @ts-ignore
            this.hasBind = true;
            // @ts-ignore
            this.texture.useCount++;
            res.bind(this);
        }
    }

    loose(key: string) {
        if (!key) return;
        // @ts-ignore
        const res: ImageRes = this.scene.load.get(key);
        if (res) {
            // @ts-ignore
            this.hasBind = false;
            // @ts-ignore
            this.texture.useCount--;
            res.loose(this);
        }
    }

    play(key: string | Phaser.Animations.Animation | Phaser.Types.Animations.PlayAnimationConfig, ignoreIfPlaying: boolean = false): this {
        return super.play(key, ignoreIfPlaying);
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
        if (this.tmpKey && this.hasBind) {
            let key;
            // @ts-ignore
            if (this.tmpKey instanceof String) {
                // @ts-ignore
                key = this.tmpKey;
            } else {
                // @ts-ignore
                key = (<Phaser.Textures.Texture>this.tmpKey).key;
            }
            this.loose(key);
        }
        super.destroy(fromScene);
    }
}

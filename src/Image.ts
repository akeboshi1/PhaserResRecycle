import { ObjectUtils } from "./object.utils";

export class Image extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, frame?: string | number) {
        super(scene, x, y, texture, frame);
        ObjectUtils.defineProperty(this, {
            hasBind: {
                value: false,
                writable: true
            }
        });
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

    setTexture(key: string, frame?: string | number): this {
        this.texture = this.scene.sys.textures.get(key);
        // @ts-ignore
        if (!this.hasBind) {
            this.bind(key);
        }
        return this.setFrame(frame);
    }

    destroy(fromScene?: boolean): void {
        // @ts-ignore
        if (this.texture && this.hasBind) {
            const key = this.texture.key;
            this.loose(key);
        }
        super.destroy(fromScene);
    }
}

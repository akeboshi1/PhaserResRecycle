import { ObjectUtils } from "./object.utils";

const GetFastValue = Phaser.Utils.Objects.GetFastValue;
export class AnimationState extends Phaser.Animations.AnimationState {
    constructor(parent: Phaser.GameObjects.GameObject) {
        super(parent);
    }

    /**
     * Internal method used to load an animation into this component.
     *
     * @method Phaser.Animations.AnimationState#setAnimation
     * @protected
     * @since 3.0.0
     *
     * @param {(string|Phaser.Types.Animations.PlayAnimationConfig)} key - The string-based key of the animation to play, or a `PlayAnimationConfig` object.
     * @param {(string} textureKey
     * @return {Phaser.GameObjects.GameObject} The Game Object that owns this Animation Component.
     */
    setAnimation(key, textureKey) {
        return this.load(key, textureKey);
    }

    load(key, textureKey?: string) {
        if (this.isPlaying) {
            this.stop();
        }

        const fun = () => {
            this.currentAnim = anim;

            //  And now override the animation values, if set in the config.
            const totalFrames = anim.getTotalFrames();
            const frameRate = GetFastValue(key, "frameRate", anim.frameRate);
            const duration = GetFastValue(key, "duration", anim.duration);
            // @ts-ignore
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

        const animKey = (typeof key === "string") ? key : GetFastValue(key, "key", null);

        //  Get the animation, first from the local map and, if not found, from the Animation Manager
        let anim = this.getAnimation(animKey);

        if (!anim) {
            if (ObjectUtils.hasOwnProperty(this.animationManager, "framesMap")) {
                const config = this.animationManager["framesMap"].get(animKey);
                this.animationManager.generateFrameNames(textureKey, config);
                const animConfig = this.animationManager["animMap"].get(animKey);
                // @ts-ignore
                anim = this.animationManager.create(animConfig);
                fun();
            } else {
                // 一定会存在一个默认的资源，如果不存在则违背设计思路
                console.warn("Missing animation: " + animKey);
            }
        } else {
            fun();
        }
        return this.parent;
    }

    getAnimation(key): Phaser.Animations.Animation {
        let anim;
        if (!this.exists(key)) {
            anim = this.animationManager.get(key);
        } else {
            anim = this.get(key);
        }
        return anim;
    }
}

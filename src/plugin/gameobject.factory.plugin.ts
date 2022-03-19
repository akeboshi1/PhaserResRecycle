import { Image } from "../Image";
import { SheetSprite } from "../sheet.sprite";

export class GameObjectFactory extends Phaser.GameObjects.GameObjectFactory {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
}

/**
 * Static method called directly by the Game Object factory functions.
 * With this method you can register a custom GameObject factory in the GameObjectFactory,
 * providing a name (`factoryType`) and the constructor (`factoryFunction`) in order
 * to be called when you call to Phaser.Scene.add[ factoryType ] method.
 *
 * @method Phaser.GameObjects.GameObjectFactory.register
 * @static
 * @since 3.0.0
 *
 * @param {string} factoryType - The key of the factory that you will use to call to Phaser.Scene.add[ factoryType ] method.
 * @param {function} factoryFunction - The constructor function to be called when you invoke to the Phaser.Scene.add method.
 */
Phaser.GameObjects.GameObjectFactory.register = function(factoryType, factoryFunction) {
    // if (!GameObjectFactory.prototype.hasOwnProperty(factoryType)) {
    GameObjectFactory.prototype[factoryType] = factoryFunction;
    // }
};

/**
 * Creates a new Image Game Object and adds it to the Scene.
 *
 * Note: This method will only be available if the Image Game Object has been built into Phaser.
 *
 * @method Phaser.GameObjects.GameObjectFactory#image
 * @since 3.0.0
 *
 * @param {number} x - The horizontal position of this Game Object in the world.
 * @param {number} y - The vertical position of this Game Object in the world.
 * @param {(string|Phaser.Textures.Texture)} texture - The key, or instance of the Texture this Game Object will use to render with, as stored in the Texture Manager.
 * @param {(string|number)} [frame] - An optional frame from the Texture this Game Object is rendering with.
 *
 * @return {Phaser.GameObjects.Image} The Game Object that was created.
 */
Phaser.GameObjects.GameObjectFactory.register("image", function(x, y, key, frame): Phaser.GameObjects.Image {
    let _key = key;
    let _frame = frame;
    const _texture = this.scene.textures.get(key);
    if (!_texture || _texture.key === "__MISSING") {
        _key = null;
        _frame = null;
    }
    const image = new Image(this.scene, 0, 0, _key, _frame);
    // 如果已经加载过，但被移除，则再次加载；如果没有加载过，却被使用，则报错
    if (!_key && key) {
        this.scene.load.reload(key).then(() => {
            image.setTexture(key);
        }).catch((error) => {
            console.error(error);
        });
    }
    return this.displayList.add(image);

});

/**
 * Creates a new Sprite Game Object and adds it to the Scene.
 *
 * Note: This method will only be available if the Sprite Game Object has been built into Phaser.
 *
 * @method Phaser.GameObjects.GameObjectFactory#sprite
 * @since 3.0.0
 *
 * @param {number} x - The horizontal position of this Game Object in the world.
 * @param {number} y - The vertical position of this Game Object in the world.
 * @param {(string|Phaser.Textures.Texture)} texture - The key, or instance of the Texture this Game Object will use to render with, as stored in the Texture Manager.
 * @param {(string|number)} [frame] - An optional frame from the Texture this Game Object is rendering with.
 * @param {string} [animationKey] - An optional frame from the Texture this Game Object is rendering with.
 * @return {Phaser.GameObjects.Sprite} The Game Object that was created.
 */
GameObjectFactory.register("sprite", function(x, y, key, frame, animationKey): Phaser.GameObjects.Sprite {
    let _key = key;
    let _frame = frame;
    const _texture = this.scene.textures.get(key);
    if (!_texture || _texture.key === "__MISSING") {
        _key = null;
        _frame = null;
    }
    const sprite = new SheetSprite(this.scene, x, y, _key, _frame, animationKey);
    this.displayList.add(sprite);
    // 如果已经加载过，但被移除，则再次加载；如果没有加载过，却被使用，则报错
    if (!_key && key) {
        this.scene.load.reload(key).then(() => {
            sprite.bind(key);
            sprite.stop();
            this.scene.anims.remove(sprite.animationKey);
            // 这一步很重要，必须把图集设置上去，否则动画无法运行
            sprite.setTexture(key);
            // @ts-ignore
            sprite.setAnimation(sprite.animationKey,key);
            sprite.play(sprite.animationKey);
        }).catch((error) => {
            console.error(error);
        });
    }
    return sprite;
});

Phaser.Plugins.PluginCache.register("GameObjectFactory", GameObjectFactory, "add");

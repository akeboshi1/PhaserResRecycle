import { Image } from "../Image";
import { SheetSprite } from "../sheet.sprite";

export class GameObjectCreator extends Phaser.GameObjects.GameObjectCreator {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
}

/**
 * Static method called directly by the Game Object creator functions.
 * With this method you can register a custom GameObject factory in the GameObjectCreator,
 * providing a name (`factoryType`) and the constructor (`factoryFunction`) in order
 * to be called when you invoke Phaser.Scene.make[ factoryType ] method.
 *
 * @method Phaser.GameObjects.GameObjectCreator.register
 * @static
 * @since 3.0.0
 *
 * @param {string} factoryType - The key of the factory that you will use to call to Phaser.Scene.make[ factoryType ] method.
 * @param {function} factoryFunction - The constructor function to be called when you invoke to the Phaser.Scene.make method.
 */
Phaser.GameObjects.GameObjectCreator.register = function (factoryType, factoryFunction) {
    //  if (!GameObjectCreator.prototype.hasOwnProperty(factoryType))
    //  {
    GameObjectCreator.prototype[factoryType] = factoryFunction;
    // }
};

/**
 * Creates a new Image Game Object and returns it.
 *
 * Note: This method will only be available if the Image Game Object has been built into Phaser.
 *
 * @method Phaser.GameObjects.GameObjectCreator#image
 * @since 3.0.0
 *
 * @param {object} config - The configuration object this Game Object will use to create itself.
 * @param {boolean} [addToScene] - Add this Game Object to the Scene after creating it? If set this argument overrides the `add` property in the config object.
 *
 * @return {Phaser.GameObjects.Image} The Game Object that was created.
 */
Phaser.GameObjects.GameObjectCreator.register("image", function (config, addToScene): Phaser.GameObjects.Image {

    if (config === undefined) { config = {}; }

    const key = Phaser.Utils.Objects.GetAdvancedValue(config, "key", null);
    const frame = Phaser.Utils.Objects.GetAdvancedValue(config, "frame", null);

    let _key = key;
    let _frame = frame;
    let _config = config;
    const _texture = this.scene.textures.get(key);
    if (!_texture || _texture.key === "__MISSING") {
        _key = null;
        _frame = null;
        _config = { key: _key, frame: _frame };
    }

    const image = new Image(this.scene, 0, 0, _key, _frame);
    if (addToScene !== undefined) {
        config.add = addToScene;
    }
    Phaser.GameObjects.BuildGameObject(this.scene, image, _config);
    // 如果已经加载过，但被移除，则再次加载；如果没有加载过，却被使用，则报错
    if (!_key && key) {
        this.scene.load.reload(key).then(() => {
            image.setTexture(key);
        }).catch((error) => {
            console.error(error);
        });
    } else {
        image["hasBind"] = true;
    }
    return image;
});

/**
 * Creates a new Sprite Game Object and returns it.
 *
 * Note: This method will only be available if the Sprite Game Object has been built into Phaser.
 *
 * @method Phaser.GameObjects.GameObjectCreator#sprite
 * @since 3.0.0
 *
 * @param {Phaser.Types.GameObjects.Sprite.SpriteConfig} config - The configuration object this Game Object will use to create itself.
 * @param {boolean} [addToScene] - Add this Game Object to the Scene after creating it? If set this argument overrides the `add` property in the config object.
 *
 * @return {Phaser.GameObjects.Sprite} The Game Object that was created.
 */
GameObjectCreator.register("sprite", function (config, addToScene): Phaser.GameObjects.Image {
    if (config === undefined) { config = {}; }

    const key = Phaser.Utils.Objects.GetAdvancedValue(config, "key", null);
    const frame = Phaser.Utils.Objects.GetAdvancedValue(config, "frame", null);
    const animationKey = Phaser.Utils.Objects.GetAdvancedValue(config, "animation", "__DEFAULTANIMATION");
    let _key = key;
    let _frame = frame;
    let _config = config;
    const _texture = this.scene.textures.get(key);
    if (!_texture || _texture.key === "__MISSING") {
        _key = null;
        _frame = null;
        _config = { key: _key, frame: _frame, animation: "__DEFAULTANIMATION" };
    }

    const sprite = new SheetSprite(this.scene, 0, 0, _key, _frame);

    if (addToScene !== undefined) {
        config.add = addToScene;
    }
    Phaser.GameObjects.BuildGameObject(this.scene, sprite, _config);

    //  Sprite specific config options:
    Phaser.GameObjects.BuildGameObjectAnimation(sprite, _config);

    // 如果已经加载过，但被移除，则再次加载；如果没有加载过，却被使用，则报错
    if (!_key && key) {
        this.scene.load.reload(key).then(() => {
            sprite.bind(key);
            sprite.stop();
            this.scene.anims.remove(sprite.animationKey);
            // @ts-ignore
            sprite.setAnimation(sprite.animationKey, key);
            sprite.play(sprite.animationKey);
        }).catch((error) => {
            console.error(error);
        });
    } else {
        sprite["hasBind"] = true;
    }
    return sprite;
});

Phaser.Plugins.PluginCache.register("GameObjectCreator", GameObjectCreator, "make");

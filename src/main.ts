import "phaser3";
import { InputPlugin } from "./plugin/input.plugin";
import { LoaderPlugin } from "./plugin/loader.plugin";
import { ResourcePlugin } from "./plugin/resource.plugin";
import { GameObjectCreator } from "./plugin/gameobject.creator.plugin";
import { GameObjectFactory } from "./plugin/gameobject.factory.plugin";
import { BasicsScene } from "./BasicsScene";
import { ObjectUtils } from "./object.utils";

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    plugins: {
        global: [
            {
                key: "InputPlugin",
                plugin: InputPlugin,
            },
            {
                key: "Loader",
                plugin: LoaderPlugin,
            },
            {
                key: "GameObjectFactory",
                plugin: GameObjectFactory,
            },
            {
                key: "GameObjectCreator",
                plugin: GameObjectCreator,
            }
        ],
        scene: [
            {
                key: "ResourcePlugin",
                plugin: ResourcePlugin,
                mapping: "res"
            },
        ]
    }
};
// @ts-ignore
var game = new Phaser.Game(config);
var anis = game.anims;
// hack animationmanager create func
const create = anis.create;
const _create = function () {
    if (!ObjectUtils.hasOwnProperty(this, "animMap")) {
        ObjectUtils.defineProperty(this, {
            hasBind: {
                value: Map,
                writable: true
            }
        });
        this["animMap"] = new Map();
    }
    const config = arguments[0];
    const key = config.key;
    if (!this["animMap"].get(key)) this["animMap"].set(key, config);
    return create.call(this, config);
};
anis.create = _create;
// hack animationmanager generatcFrameNames func
const generateFrameNames = anis.generateFrameNames;
const _generatFrameNames = function () {
    if (!ObjectUtils.hasOwnProperty(this, "framesMap")) {
        ObjectUtils.defineProperty(this, {
            hasBind: {
                value: Map,
                writable: true
            }
        });
        this["framesMap"] = new Map();
    }
    const key = arguments[0];
    const config = arguments[1];
    const animKey = arguments[2] || key;
    if (!this["framesMap"].get(animKey)) this["framesMap"].set(animKey, config);
    // key config
    return generateFrameNames.call(this, key, config);
};
anis.generateFrameNames = _generatFrameNames;

// hack animationmanager destroy func
const destroy = anis.destroy;
const _destroy = function () {
    if (ObjectUtils.hasOwnProperty(this, "animMap")) {
        this["animMap"].clear();
        this["animMap"] = null;
    }
    if (ObjectUtils.hasOwnProperty(this, "framesMap")) {
        this["framesMap"].clear();
        this["framesMap"] = null;
    }
    destroy.call(this);
};
anis.destroy = _destroy;

game.scene.add("uiScene", BasicsScene, true, { x: 0, y: 0 });

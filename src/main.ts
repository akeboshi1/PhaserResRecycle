import "phaser3";
import { InputPlugin } from "./plugin/input.plugin";
import { LoaderPlugin } from "./plugin/loader.plugin";
import { ResourcePlugin } from "./plugin/resource.plugin";
import { GameObjectCreator } from "./plugin/gameobject.creator.plugin";
import { GameObjectFactory } from "./plugin/gameobject.factory.plugin";
import { BasicsScene } from "./BasicsScene";

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

game.scene.add("uiScene", BasicsScene, true, { x: 0, y: 0 });

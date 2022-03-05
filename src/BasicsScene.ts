
export class BasicsScene extends Phaser.Scene {

    constructor(config) {
        super(config);
    }

    init() {

    }


    preload() {
        this.load.image('sky', '../assets/sky.png');
        this.load.image('ground', '../assets/platform.png');
        this.load.image('star', '../assets/star.png');
        this.load.image('bomb', '../assets/star.png');
        // @ts-ignore
        this.load.spritesheet('dude', '../assets/dude.png', false, { frameWidth: 32, frameHeight: 48 })

    }

    create() {

        // @ts-ignore
        this.res.init();

        /** Background */
        const image = this.add.image(0, 0, 'sky');
        image.setScale(2, 2);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

    }
}

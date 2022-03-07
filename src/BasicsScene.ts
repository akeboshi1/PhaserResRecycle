
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
        this.load.image('bomb', '../assets/bomb.png');
        // @ts-ignore
        this.load.spritesheet('dude', '../assets/dude.png', false, { frameWidth: 32, frameHeight: 48 })

    }

    create() {

        // @ts-ignore
        this.res.init();

        /** sky */
        const image = this.add.image(0, 0, 'sky');
        image.setScale(2, 2);

        /** Background */
        const bg = this.add.image(0, 0, 'star');
        bg.setScale(2, 2);
        const con = this.add.container();
        con.setPosition(100, 100);
        con.add(bg);
        con.setSize(bg.width, bg.height);
        con.setInteractive();
        con.once("pointerdown", () => {
            bg.destroy();
            con.destroy(true);
        });

        // this.anims.create({
        //     key: 'left',
        //     frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        //     frameRate: 10,
        //     repeat: -1
        // })

        // this.anims.create({
        //     key: 'turn',
        //     frames: [{ key: 'dude', frame: 4 }],
        //     frameRate: 20
        // });

        // this.anims.create({
        //     key: 'right',
        //     frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        //     frameRate: 10,
        //     repeat: -1
        // });

        const clickImg = this.add.image(0, 0, "bomb");
        clickImg.setScale(2, 2);
        clickImg.setPosition(200,200);
        clickImg.setInteractive();
        clickImg.on("pointerdown", () => {
            const bg = this.add.image(200,200, 'star');
            bg.setScale(2, 2);
        });
    }
}

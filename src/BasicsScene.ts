
export class BasicsScene extends Phaser.Scene {

    private showTF: Phaser.GameObjects.Text;
    private _text: string = "";
    private sprite1: Phaser.GameObjects.Sprite;
    constructor(config) {
        super(config);
    }

    init() {

    }


    preload() {
        this.load.image('sky', '../assets/sky.png');
        // this.load.image('ground', '../assets/platform.png');
        this.load.image('star', '../assets/star.png');
        this.load.image('bomb', '../assets/bomb.png');
        // @ts-ignore
        // this.load.spritesheet('dude', '../assets/dude.png', false, { frameWidth: 32, frameHeight: 48 });
        // @ts-ignore
        this.load.atlas("lifteffect", "../assets/lifteffect.png", "../assets/lifteffect.json", true);
        // this.load.atlas("loading", "../assets/loading.png", "../assets/loading.json");
    }

    create() {

        // @ts-ignore
        this.res.init();

        /** sky */
        // const image = this.add.image(0, 0, 'sky');
        // image.setScale(2, 2);

        // this.anims.create({
        //     key: "loading_anis",
        //     // @ts-ignore
        //     frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }, "loading_anis"),
        //     frameRate: 5,
        //     repeat: -1
        // });

        // this.anims.create({
        //     key: "__DEFAULTANIMATION",
        //     // @ts-ignore
        //     frames: this.anims.generateFrameNames("lifteffect", { prefix: "lifteffect_", start: 1, end: 12, zeroPad: 1 }, "__DEFAULTANIMATION"),
        //     frameRate: 5,
        //     repeat: -1
        // });

        // const sprite = this.add.sprite(300, 100 * Math.random(), "loading").setScale(2);
        // sprite.play("loading_anis");

        this.sprite1 = this.make.sprite(undefined, false);
        this.load.once(Phaser.Loader.Events.COMPLETE, this.onCompleteHandler, this);
        this.load.atlas("loading", "../assets/loading.png", "../assets/loading.json");
        this.load.start();


        /** Background */
        // const bg = this.add.image(0, 0, 'star');
        // bg.setScale(2, 2);
        const con = this.add.container();
        con.setPosition(100, 100);
        // con.add(bg);
        con.setSize(100,100);
        con.setInteractive();
        con.add(this.sprite1);
        con.once("pointerdown", () => {
            this.sprite1.destroy();
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
        this.showTF = this.add.text(100, 400,
            "show:", {
            fontSize: 20 + "px",
            fontFamily: "Source Han Sans"
        }
        );
        const clickImg = this.add.image(0, 0, "bomb");
        clickImg.setScale(2, 2);
        clickImg.setPosition(200, 200);
        clickImg.setInteractive();
        clickImg.on("pointerdown", () => {
            const sprite = this.add.sprite(300, 100, "loading").setScale(2);
            sprite.play("loading_anis");
        });
    }

    showTxt(txt: string) {
        this._text += this._text + txt + " ";
        this.showTF.text = this._text;
    }

    private onCompleteHandler() {
        this.anims.create({
            key: "loading_anis",
            // @ts-ignore
            frames: this.anims.generateFrameNames("loading", { prefix: "loading_", start: 1, end: 3, zeroPad: 1, suffix: ".png" }, "loading_anis"),
            frameRate: 5,
            repeat: -1
        });
        this.sprite1.setTexture("loading");
        // @ts-ignore
        // this.sprite1.setAnimation("loading_anis", "loading");
        this.sprite1.play("loading_anis");
    }
}

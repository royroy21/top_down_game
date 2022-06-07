import Phaser from "phaser";

class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");

        this.scaleSize = 2.5;

        this.player = null;
        this.playerSpeed = 300;

        this.gamepad = null;
    }

    preload() {
        this.load.spritesheet(
            "playerSpriteSheet",
            "assets/player_sprite_sheet.png", {
                frameWidth: 72,
                frameHeight: 92,
            }
        );
        this.load.tilemapTiledJSON("map", "assets/map.json");
        this.load.image("tiles", "assets/64x64DungeonTileset.v4.png");
    }

    create() {
        const map = this.make.tilemap({
            key: "map"
        });
        this.scale.resize(map.widthInPixels, map.heightInPixels);
        const tileSet = map.addTilesetImage(
            "64x64DungeonTileset.v4",
            "tiles",
            64,
            64,
        );
        map.createLayer("floor", tileSet, 0, 0);
        const blocking = map.createLayer("blocking", tileSet, 0, 0);
        blocking.setCollisionByProperty({
            collides: true
        });

        // Debug
        // var debugGraphics = this.add.graphics().setAlpha(0.7);
        // floor.renderDebug(debugGraphics, {
        //   tileColor: null,
        //   collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        //   faceTileColor: new Phaser.Display.Color(40, 39, 37, 255),
        // })

        this.player = this.physics.add.sprite(200, 200, "playerSpriteSheet");
        this.player.body.setMaxSpeed(this.playerSpeed);
        this.physics.add.collider(this.player, blocking);
        // this.cameras.main.setBounds(0, 0, 3000, 2000);
        console.log("@map ", map.widthInPixels, map.heightInPixels);
        this.cameras.main.setBounds(0, 0, 3000, 1588);
        this.cameras.main.startFollow(this.player, true);
        // this.cameras.main.setBackgroundColor('#ccccff');

        this.anims.create({
            key: "walk",
            frameRate: 7,
            frames: this.anims.generateFrameNumbers(
                "playerSpriteSheet", {
                    start: 1,
                    end: 0,
                },
            ),
            repeat: -1
        });
        this.anims.create({
            key: "idle",
            frameRate: 7,
            frames: [{key: "playerSpriteSheet", frame: 0}],
        });

        // this.player.setBounce(0.2); // our player will bounce from items
        this.player.setCollideWorldBounds(true); // don't go out of the map
        this.playerCursors = this.input.keyboard.createCursorKeys();

        // TODO - On linux the 8BitDo controller works but not the xbox controller :/
        //  Will require testing on windows + OSX.
        this.input.gamepad.once("connected", (pad, button, index) => {
            console.log("Gamepad connected ...");
            this.gamepad = pad;
        }, this);
    }

    update(time, delta) {
        // this.cameras.main.centerOn(this.player.x, this.player.y);
        // console.log("centerOn is on ..");
        this.processUserInput();
    }

    processUserInput() {
        // TODO - maybe these should be methods on a Custom Player class?
        const stopPlayerVelocityX = () => {
            this.player.body.setVelocityX(0);
        }
        const stopPlayerVelocityY = () => {
            this.player.body.setVelocityY(0);
        }
        const stopPlayer = () => {
            stopPlayerVelocityX();
            stopPlayerVelocityY();
            this.player.play("idle");
        }
        const movePlayerLeft = () => {
            if (this.player.flipX) {
                this.player.flipX = false;
            }
            this.player.body.setVelocityX(-Math.abs(this.playerSpeed));
            if (!(this.player.anims.isPlaying && this.player.anims.currentAnim.key === "walk")) {
                this.player.play("walk");
            }
        }
        const movePlayerRight = () => {
            if (!this.player.flipX) {
                this.player.flipX = true;
            }
            this.player.body.setVelocityX(this.playerSpeed);
            if (!(this.player.anims.isPlaying && this.player.anims.currentAnim.key === "walk")) {
                this.player.play("walk");
            }
        }
        const movePlayerUp = () => {
            this.player.body.setVelocityY(-Math.abs(this.playerSpeed));
            if (!(this.player.anims.isPlaying && this.player.anims.currentAnim.key === "walk")) {
                this.player.play("walk");
            }
        }
        const movePlayerDown = () => {
            this.player.body.setVelocityY(this.playerSpeed);
            if (!(this.player.anims.isPlaying && this.player.anims.currentAnim.key === "walk")) {
                this.player.play("walk");
            }
        }

        if (this.gamepad) {
            if (
                !this.gamepad.left &&
                !this.gamepad.right &&
                !this.gamepad.up &&
                !this.gamepad.down) {
                stopPlayer();
            }
            if (!this.gamepad.up || !this.gamepad.down) {
                stopPlayerVelocityY();
            }
            if (!this.gamepad.left || !this.gamepad.right) {
                stopPlayerVelocityX();
            }
            if (this.gamepad.left) {
                movePlayerLeft();
            }
            if (this.gamepad.right) {
                movePlayerRight();
            }
            if (this.gamepad.up) {
                movePlayerUp();
            }
            if (this.gamepad.down) {
                movePlayerDown();
            }
        } else {
            // Switch to keyboard controls.
            if (
                !this.playerCursors.left.isDown &&
                !this.playerCursors.right.isDown &&
                !this.playerCursors.up.isDown &&
                !this.playerCursors.down.isDown) {
                stopPlayer();
            }
            if (!this.playerCursors.up.isDown || !this.playerCursors.down.isDown) {
                stopPlayerVelocityY();
            }
            if (!this.playerCursors.left.isDown || !this.playerCursors.right.isDown) {
                stopPlayerVelocityX();
            }
            if (this.playerCursors.left.isDown) {
                movePlayerLeft();
            }
            if (this.playerCursors.right.isDown) {
                movePlayerRight();
            }
            if (this.playerCursors.up.isDown) {
                movePlayerUp();
            }
            if (this.playerCursors.down.isDown) {
                movePlayerDown();
            }
        }
    }
}

export default MainScene;

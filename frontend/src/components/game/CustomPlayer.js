import Phaser from "phaser";
import RangedWeapon from "./RangedWeapon";

// TODO - this is hacked. The container doesn't really do anything.
// Maybe we could simply remove the container and use a class to hold
// shiz together?
class CustomPlayer extends Phaser.GameObjects.Container {
    constructor(config) {
        const playerBody = new Body({
            scene: config.scene,
            x: 0,
            y: 0,
            key: config.key,
            label: config.label,
            gameID: config.gameID,
            playerID: config.playerID,
            depth: 1,
        });

        const rangedWeaponXOffSet = 10;
        const rangedWeaponYOffSet = 26;
        const rangedWeapon = new RangedWeapon({
            scene: config.scene,
            x: rangedWeaponXOffSet,
            y: rangedWeaponYOffSet,
            key: "ak47",
            depth: 2,
        })
        super(config.scene, config.x, config.y, [rangedWeapon, playerBody]);

        this.playerBody = playerBody;
        this.rangedWeapon = rangedWeapon;
        this.rangedWeaponXOffSet = rangedWeaponXOffSet;
        this.rangedWeaponYOffSet = rangedWeaponYOffSet;

        this.key = config.key;
        this.label = config.label;
        this.gameID = config.gameID;
        this.playerID = config.playerID;
        this.createAnimations();
        this.playerSpeed = 300;
        this.playerBody.body.setMaxSpeed(this.playerSpeed);
        this.updatePlayerPosition = false;
        this.playerStillIdle = false;
        this.playerCursors = this.scene.input.keyboard.createCursorKeys();

        // TODO - On linux the 8BitDo controller works but not the xbox controller :/
        //  Will require testing on windows + OSX.
        //  Also if user has two or more instances of the game open on one computer
        //  the gamepad controllers all players at the same time.
        this.scene.input.gamepad.once("connected", (pad, button, index) => {
            console.log("Gamepad connected ...");
            this.gamepad = pad;
        }, this);

        console.log("player depth: ", this.playerBody.depth);
        console.log("ranged weapon depth: ", this.rangedWeapon.depth);
    }

    createAnimations() {
        this.scene.anims.create({
            key: `${this.key}_walk`,
            frameRate: 7,
            frames: this.scene.anims.generateFrameNumbers(
                `${this.key}KnightSpriteSheet`, {
                    start: 1,
                    end: 0,
                },
            ),
            repeat: -1
        });
        this.scene.anims.create({
            key: `${this.key}_idle`,
            frameRate: 7,
            frames: [{
                key: `${this.key}KnightSpriteSheet`,
                frame: 0
            }],
        });
    }

    stopPlayerVelocityX() {
        this.playerBody.body.setVelocityX(0);
    }

    stopPlayerVelocityY() {
        this.playerBody.body.setVelocityY(0);
    }

    stopPlayer() {
        this.stopPlayerVelocityX();
        this.stopPlayerVelocityY();
        this.playerBody.play(`${this.key}_idle`);
        if (this.updatePlayerPosition) {
            if (!this.playerStillIdle) {
                this.playerStillIdle = true;
                this.updatePlayerPosition = true;
            } else {
                this.playerStillIdle = false;
                this.updatePlayerPosition = false;
            }
        }
    }

    movePlayerLeft() {
        if (this.playerBody.flipX) {
            this.playerBody.flipX = false;
        }
        this.bringToTop(this.playerBody);

        this.playerBody.body.setVelocityX(-Math.abs(this.playerSpeed));
        if (!(this.playerBody.anims.isPlaying && this.playerBody.anims.currentAnim.key === `${this.key}_walk`)) {
            this.playerBody.play(`${this.key}_walk`);
        }
        this.updatePlayerPosition = true;
        this.playerStillIdle = false;
    }

    movePlayerRight() {
        if (!this.playerBody.flipX) {
            this.playerBody.flipX = true;
        }
        this.bringToTop(this.rangedWeapon);

        this.playerBody.body.setVelocityX(this.playerSpeed);
        if (!(this.playerBody.anims.isPlaying && this.playerBody.anims.currentAnim.key === `${this.key}_walk`)) {
            this.playerBody.play(`${this.key}_walk`);
        }
        this.updatePlayerPosition = true;
        this.playerStillIdle = false;
    }

    movePlayerUp() {
        this.playerBody.body.setVelocityY(-Math.abs(this.playerSpeed));
        if (!(this.playerBody.anims.isPlaying && this.playerBody.anims.currentAnim.key === `${this.key}_walk`)) {
            this.playerBody.play(`${this.key}_walk`);
        }
        this.updatePlayerPosition = true;
        this.playerStillIdle = false;
    }

    movePlayerDown() {
        this.playerBody.body.setVelocityY(this.playerSpeed);
        if (!(this.playerBody.anims.isPlaying && this.playerBody.anims.currentAnim.key === `${this.key}_walk`)) {
            this.playerBody.play(`${this.key}_walk`);
        }
        this.updatePlayerPosition = true;
        this.playerStillIdle = false;
    }

    processUserInput() {
        if (this.gamepad) {
            if (
                !this.gamepad.left &&
                !this.gamepad.right &&
                !this.gamepad.up &&
                !this.gamepad.down) {
                this.stopPlayer();
            }
            if (!this.gamepad.up || !this.gamepad.down) {
                this.stopPlayerVelocityY();
            }
            if (!this.gamepad.left || !this.gamepad.right) {
                this.stopPlayerVelocityX();
            }
            if (this.gamepad.left) {
                this.movePlayerLeft();
            }
            if (this.gamepad.right) {
                this.movePlayerRight();
            }
            if (this.gamepad.up) {
                this.movePlayerUp();
            }
            if (this.gamepad.down) {
                this.movePlayerDown();
            }
        } else {
            // Switch to keyboard controls.
            if (
                !this.playerCursors.left.isDown &&
                !this.playerCursors.right.isDown &&
                !this.playerCursors.up.isDown &&
                !this.playerCursors.down.isDown) {
                this.stopPlayer();
            }
            if (!this.playerCursors.up.isDown || !this.playerCursors.down.isDown) {
                this.stopPlayerVelocityY();
            }
            if (!this.playerCursors.left.isDown || !this.playerCursors.right.isDown) {
                this.stopPlayerVelocityX();
            }
            if (this.playerCursors.left.isDown) {
                this.movePlayerLeft();
            }
            if (this.playerCursors.right.isDown) {
                this.movePlayerRight();
            }
            if (this.playerCursors.up.isDown) {
                this.movePlayerUp();
            }
            if (this.playerCursors.down.isDown) {
                this.movePlayerDown();
            }
        }

        this.rangedWeapon.flipX = !(this.playerBody.flipX);
        this.rangedWeapon.y = this.playerBody.y + this.rangedWeaponYOffSet;
        if (this.playerBody.flipX) {
            this.rangedWeapon.x = this.playerBody.x + this.rangedWeaponXOffSet;
        } else {
            this.rangedWeapon.x = this.playerBody.x - this.rangedWeaponXOffSet;
        }

        if (!this.updatePlayerPosition) {
            return null;
        }
        this.scene.channel.emit("chat message", JSON.stringify({
            type: "updatePlayerPosition",
            label: this.label,
            gameID: this.gameID,
            playerID: this.playerID,
            key: this.key,
            animation: this.playerBody.anims.currentAnim.key,
            flipX: this.flipX,
            x: this.x,
            y: this.y,
        }));
    }
}

class Body extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }
}

export default CustomPlayer;

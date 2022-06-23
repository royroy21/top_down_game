import Phaser from "phaser";

class CustomPlayer extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        this.scene = config.scene;
        this.key = config.key;
        this.label = config.label;
        this.gameID = config.gameID;
        this.playerID = config.playerID;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.createAnimations();

        this.playerSpeed = 300;
        this.body.setMaxSpeed(this.playerSpeed);
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
    }

    createAnimations() {
        this.scene.anims.create({
            key: "walk",
            frameRate: 7,
            frames: this.scene.anims.generateFrameNumbers(
                this.key, {
                    start: 1,
                    end: 0,
                },
            ),
            repeat: -1
        });
        this.scene.anims.create({
            key: "idle",
            frameRate: 7,
            frames: [{
                key: this.key,
                frame: 0
            }],
        });
    }

    stopPlayerVelocityX() {
        this.body.setVelocityX(0);
    }

    stopPlayerVelocityY() {
        this.body.setVelocityY(0);
    }

    stopPlayer() {
        this.stopPlayerVelocityX();
        this.stopPlayerVelocityY();
        this.play("idle");
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
        if (this.flipX) {
            this.flipX = false;
        }
        this.body.setVelocityX(-Math.abs(this.playerSpeed));
        if (!(this.anims.isPlaying && this.anims.currentAnim.key === "walk")) {
            this.play("walk");
        }
        this.updatePlayerPosition = true;
        this.playerStillIdle = false;
    }

    movePlayerRight() {
        if (!this.flipX) {
            this.flipX = true;
        }
        this.body.setVelocityX(this.playerSpeed);
        if (!(this.anims.isPlaying && this.anims.currentAnim.key === "walk")) {
            this.play("walk");
        }
        this.updatePlayerPosition = true;
        this.playerStillIdle = false;
    }

    movePlayerUp() {
        this.body.setVelocityY(-Math.abs(this.playerSpeed));
        if (!(this.anims.isPlaying && this.anims.currentAnim.key === "walk")) {
            this.play("walk");
        }
        this.updatePlayerPosition = true;
        this.playerStillIdle = false;
    }

    movePlayerDown() {
        this.body.setVelocityY(this.playerSpeed);
        if (!(this.anims.isPlaying && this.anims.currentAnim.key === "walk")) {
            this.play("walk");
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

        if (!this.updatePlayerPosition) {
            return null;
        }
        this.scene.channel.emit("chat message", JSON.stringify({
            type: "updatePlayerPosition",
            label: this.label,
            gameID: this.gameID,
            playerID: this.playerID,
            animation: "brown_" + this.anims.currentAnim.key, // TODO - this is a hack
            flipX: this.flipX,
            x: this.x,
            y: this.y,
        }));
    }
}

export default CustomPlayer;

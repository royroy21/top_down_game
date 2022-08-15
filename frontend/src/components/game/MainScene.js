import Phaser from "phaser";
import geckos from '@geckos.io/client';
import CustomPlayer from "./CustomPlayer";

// Helper functions.
// TODO - put into helper.js?
const getRandomNumber = (min, max, fractionDigits = 0) => {
    const number = Math.random() * (max - min) + min;
    return parseFloat(number.toFixed(fractionDigits))
}

class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.key = null;
        this.player = null;
        this.playerLabel = null;
        this.otherPlayers = {};
        this.gamepad = null;
        this.map = null;
        this.blocking = null;
    }

    preload() {
        this.load.spritesheet(
            "blueKnightSpriteSheet",
            "assets/blue_knight_sprite_sheet.png", {
                frameWidth: 72,
                frameHeight: 92,
            }
        );
        this.load.spritesheet(
            "brownKnightSpriteSheet",
            "assets/brown_knight_sprite_sheet.png", {
                frameWidth: 72,
                frameHeight: 92,
            }
        );
        this.load.tilemapTiledJSON("map", "assets/map.json");
        this.load.image("tiles", "assets/64x64DungeonTileset.v4.png");
    }

    create() {
        this.connectToServer();
    }

    connectToServer() {
        this.channel = geckos({
            // host: "198.168.0.88",
            port: 9208
        }) // default port is 9208

        this.channel.onConnect(error => {
            if (error) {
                console.error(error.message)
                return
            }
            this.channel.on("chat message", data => {
                this.processServerMessage(data);
            })
            this.channel.emit("chat message", JSON.stringify({
                type: "connect",
                gameID: this.getGameID(),
                playerID: this.getPlayerID(),
                animation: "brown_idle", // TODO - this is a hack
                flipX: false,
            }));
        })
    }

    processServerMessage(data) {
        console.log(`Server message: '${data}'`)
        const parsedData = JSON.parse(data);
        const existingPlayers = {};
        Object.keys(parsedData).forEach(key => {
            if (key.startsWith("player")) {
                existingPlayers[parsedData[key].id] = key;
            }
        });
        if (!this.playerLabel) {
            this.playerLabel = existingPlayers[this.getPlayerID()];
            this.initialiseGame(
              parsedData[this.playerLabel].key,
              parsedData[this.playerLabel].x,
              parsedData[this.playerLabel].y,
            );
        }
        this.updateOtherPlayers(parsedData);
    }

    initialiseGame(key, x, y) {
        this.configureMap();
        this.key = key;
        this.player = new CustomPlayer({
            scene: this,
            x: x,
            y: y,
            key: key,
            label: this.playerLabel,
            gameID: this.getGameID(),
            playerID: this.getPlayerID(),
        });
        this.physics.add.collider(this.player, this.blocking);
        this.configureCamera();
    }

    getPlayerID() {
        const playerID = localStorage.getItem("playerID");
        if (!playerID) {
            const newPlayerID = `Anon${getRandomNumber(100000, 999999)}`
            localStorage.setItem("playerID", newPlayerID);
            return newPlayerID
        } else {
            return playerID
        }
    }

    getGameID() {
        // If a player joins a game that game ID should be in local storage.
        // If no gameID exists a new one is created. This will create a game
        // for others to join.
        const gameID = localStorage.getItem("gameID");
        if (!gameID) {
            const newGameID = `game${getRandomNumber(100000, 999999)}`;
            localStorage.setItem("gameID", newGameID);
            return newGameID
        } else {
            return gameID
        }
    }

    configureMap() {
        this.map = this.make.tilemap({
            key: "map"
        });
        this.scale.resize(this.map.widthInPixels, this.map.heightInPixels);
        const tileSet = this.map.addTilesetImage(
            "64x64DungeonTileset.v4",
            "tiles",
            64,
            64,
        );
        this.map.createLayer("floor", tileSet, 0, 0);
        this.blocking = this.map.createLayer("blocking", tileSet, 0, 0);
        this.blocking.setCollisionByProperty({
            collides: true
        });
    }

    configureCamera() {
        this.cameras.main.setViewport(
          0,
          0,
          window.visualViewport.width,
          window.visualViewport.height,
        )
        this.cameras.main.setBounds(
          0,
          0,
          this.map.widthInPixels,
          this.map.heightInPixels,
        );
        this.cameras.main.startFollow(
          this.player,
          true,
          0.1,
          0.1,
        );
    }

    updateOtherPlayers(data) {
        Object.keys(data).forEach(key => {
            if (key.startsWith("player") && key !== this.playerLabel) {
                if (!Object.keys(this.otherPlayers).includes(key)) {
                    this.createOtherPlayer(key, data[key]);
                } else {
                    this.updateOtherPlayer(key, data[key]);
                }
            }
        })
    }

    createOtherPlayer(label, data) {
        this.otherPlayers[label] = this.physics.add.sprite(
          data.x,
          data.y,
          `${data.key}KnightSpriteSheet`,
        );
        this.otherPlayers[label].body.immovable = true;
        this.otherPlayers[label].body.moves = false;
        this.physics.add.collider(this.otherPlayers[label], this.blocking);
        this.physics.add.collider(this.otherPlayers[label], this.player);

        this.anims.create({
            key: `${data.key}_walk`,
            frameRate: 7,
            frames: this.anims.generateFrameNumbers(
                `${data.key}KnightSpriteSheet`, {
                    start: 1,
                    end: 0,
                },
            ),
            repeat: -1
        });
        this.anims.create({
            key: `${data.key}_idle`,
            frameRate: 7,
            frames: [{
                key: `${data.key}KnightSpriteSheet`,
                frame: 0
            }],
        });
    }

    updateOtherPlayer(label, data) {
        this.otherPlayers[label].x = data.x;
        this.otherPlayers[label].y = data.y;
        this.otherPlayers[label].flipX = data.flipX;
        if (!(
                this.otherPlayers[label].anims &&
                this.otherPlayers[label].anims.isPlaying &&
                this.otherPlayers[label].anims.currentAnim.key === data.animation
            )) {
            this.otherPlayers[label].play(data.animation);
        }
    }

    update(time, delta) {
        if (!this.playerLabel) {
            return null;
        }
        this.player.processUserInput();
    }
}

export default MainScene;

import Phaser from "phaser";

class RangedWeapon extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        this.scene.add.existing(this);
    }
}

export default RangedWeapon;

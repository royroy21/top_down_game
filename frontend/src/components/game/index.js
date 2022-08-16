import React from "react";
import Phaser from "phaser";
import MainScene from "./MainScene";

export default class Game extends React.Component {
  componentDidMount() {
    // Stops right click menus
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    const config = {
      type: Phaser.AUTO,
      parent: "phaserGame",
      width: 3000,
      height: 2000,
      // width: 2048,
      // height: 1088,
      scene: [MainScene],
      backgroundColor: "#000",
      physics: {
        default: "arcade",
        arcade: {
            debug: false,
        }
      },
      input: {
        gamepad: true,
      },
    }
    this.game = new Phaser.Game(config)
  }

  componentWillUnmount() {
    this.game.destroy(true, false);
    this.game = null;
  }

  shouldComponentUpdate() {
    // Stops React re-rendering the game component.
    return false
  }

  render() {
    return <div id="phaserGame" />
  }
}

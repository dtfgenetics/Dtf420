import { Scene } from "phaser";

const BOARD_SIZE = 15;
const CELL_SIZE = 30;

export class BootScene extends Scene {
  constructor() {
    super("BurnBudsBoot");
  }

  create() {
    const { width } = this.scale;
    const boardPixels = BOARD_SIZE * CELL_SIZE;
    const boardX = Math.round((width - boardPixels) / 2);
    const boardY = 130;

    this.add.text(width / 2, 38, "BURN BUDS", {
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "42px",
      fontStyle: "bold",
      color: "#d8ff75",
    }).setOrigin(0.5, 0);

    this.add.text(width / 2, 88, "DTF420 game engine validation", {
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "18px",
      color: "#9fb3a5",
    }).setOrigin(0.5, 0);

    const graphics = this.add.graphics();

    graphics.fillStyle(0x0d2116, 1);
    graphics.fillRect(boardX, boardY, boardPixels, boardPixels);
    graphics.lineStyle(1, 0x42624d, 0.9);

    for (let index = 0; index <= BOARD_SIZE; index += 1) {
      const offset = index * CELL_SIZE;
      graphics.lineBetween(boardX + offset, boardY, boardX + offset, boardY + boardPixels);
      graphics.lineBetween(boardX, boardY + offset, boardX + boardPixels, boardY + offset);
    }

    graphics.lineStyle(3, 0xb7e25d, 1);
    graphics.strokeRect(boardX, boardY, boardPixels, boardPixels);

    this.add.text(width / 2, boardY + boardPixels + 24, "15 × 15 board ready", {
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "20px",
      color: "#d7e2da",
    }).setOrigin(0.5, 0);
  }
}

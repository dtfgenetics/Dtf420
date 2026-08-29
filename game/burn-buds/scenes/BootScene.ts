import { Scene } from "phaser";

const BOARD_SIZE = 15;
const CELL_SIZE = 30;
const COLUMN_LABELS = "ABCDEFGHIJKLMNO".split("");

export class BootScene extends Scene {
  constructor() {
    super("BurnBudsBoot");
  }

  create() {
    const { width, height } = this.scale;
    const boardPixels = BOARD_SIZE * CELL_SIZE;
    const boardX = Math.round((width - boardPixels) / 2) + 8;
    const boardY = 132;
    const graphics = this.add.graphics();

    graphics.fillStyle(0x07110b, 1);
    graphics.fillRect(0, 0, width, height);

    graphics.fillStyle(0x0b1c12, 1);
    graphics.fillRoundedRect(36, 24, width - 72, 76, 18);
    graphics.lineStyle(1, 0x294936, 0.9);
    graphics.strokeRoundedRect(36, 24, width - 72, 76, 18);

    this.add.text(58, 42, "BURN BUDS", {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "30px",
      fontStyle: "bold",
      color: "#e9f7d1",
    });

    this.add.text(60, 73, "15 × 15 board preview", {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "13px",
      color: "#8ea399",
      letterSpacing: 1,
    });

    graphics.fillStyle(0x122a1c, 1);
    graphics.fillRoundedRect(width - 188, 42, 126, 38, 19);
    graphics.lineStyle(1, 0x5f874f, 0.8);
    graphics.strokeRoundedRect(width - 188, 42, 126, 38, 19);

    this.add.text(width - 125, 52, "PREVIEW", {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#cfff8b",
      letterSpacing: 1.5,
    }).setOrigin(0.5, 0);

    graphics.fillStyle(0x09170f, 1);
    graphics.fillRoundedRect(boardX - 34, boardY - 28, boardPixels + 52, boardPixels + 46, 16);
    graphics.lineStyle(1, 0x1f3829, 1);
    graphics.strokeRoundedRect(boardX - 34, boardY - 28, boardPixels + 52, boardPixels + 46, 16);

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let column = 0; column < BOARD_SIZE; column += 1) {
        const isAlt = (row + column) % 2 === 0;
        graphics.fillStyle(isAlt ? 0x10281a : 0x0d2217, 1);
        graphics.fillRect(
          boardX + column * CELL_SIZE,
          boardY + row * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE,
        );
      }
    }

    graphics.lineStyle(1, 0x355540, 0.72);
    for (let index = 0; index <= BOARD_SIZE; index += 1) {
      const offset = index * CELL_SIZE;
      graphics.lineBetween(boardX + offset, boardY, boardX + offset, boardY + boardPixels);
      graphics.lineBetween(boardX, boardY + offset, boardX + boardPixels, boardY + offset);
    }

    graphics.lineStyle(3, 0xb7e25d, 0.9);
    graphics.strokeRect(boardX, boardY, boardPixels, boardPixels);

    COLUMN_LABELS.forEach((label, index) => {
      this.add.text(boardX + index * CELL_SIZE + CELL_SIZE / 2, boardY - 18, label, {
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        fontSize: "10px",
        fontStyle: "bold",
        color: "#789083",
      }).setOrigin(0.5, 0.5);
    });

    for (let index = 0; index < BOARD_SIZE; index += 1) {
      this.add.text(boardX - 17, boardY + index * CELL_SIZE + CELL_SIZE / 2, String(index + 1), {
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        fontSize: "10px",
        fontStyle: "bold",
        color: "#789083",
      }).setOrigin(0.5, 0.5);
    }

    this.add.text(width / 2, height - 36, "BOARD ONLINE  •  GAMEPLAY SYSTEMS IN DEVELOPMENT", {
      fontFamily: "Inter, Arial, Helvetica, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#92a49a",
      letterSpacing: 1.4,
    }).setOrigin(0.5, 0.5);
  }
}

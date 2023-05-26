import { BoardPosition, PositionType } from "common/board/types";
import { RuntimeConfig } from "common/config/types";
import { IGame } from "common/game/types";
import { assertNever } from "common/util";

type BoardConfig = {
  totalHeightWidth: number;
  totalNonCornerPositions: number;
  totalNonCornerPositionsPerSide: number;
  getSide(i: number): "left" | "right" | "top" | "bottom" | "corner";
};

const UTFChars = {
  solidBlock: "█",
  leftVerticalLine: "⎹",
  rightVerticalLine: "⎸",
  middleVerticalLine: "|",
  topHorizontalLine: "▁",
  middleHorizontalLine: "—",
  bottomHorizontalLine: "▔",
} as const;
function getBlankBox(height: number, width: number): string[] {
  const rows: string[] = [];
  for (let i = 0; i < height; i++) {
    rows.push(" ".repeat(width));
  }
  return rows;
}
function getLeftRightBorderBox(height: number, width: number): string[] {
  const rows: string[] = [];
  for (let i = 0; i < height; i++) {
    rows.push(UTFChars.leftVerticalLine + " ".repeat(width - 2) + UTFChars.rightVerticalLine);
  }
  return rows;
}
function centerText(text: string, width: number): string {
  const extraWidth = width - text.length;
  const onEachSide = extraWidth / 2;
  const leftSpacing = Math.floor(onEachSide);
  const rightSpacing = Math.ceil(onEachSide);
  return " ".repeat(leftSpacing) + text + " ".repeat(rightSpacing);
}
function padTextLeftRight(text: string, width: number): string {
  if (text.length + 2 > width) {
    // TODO: wrap text
    throw new Error("text too long");
  }
  const left = UTFChars.leftVerticalLine;
  const right = UTFChars.rightVerticalLine;
  const centered = centerText(text, width - 2);
  return left + centered + right;
}
export class CliBoardDisplay {
  private game!: IGame;
  public boardConfig!: BoardConfig;
  private boardBase!: string;
  constructor(private config: RuntimeConfig) {}
  private getLeftSidePosition(position: BoardPosition<PositionType>): string[] {
    // main x/y: w/h; buffer x/y: c - w/h
    // TODO: implement this properly
    return this.getTopSidePosition(position);
  }
  private getRightSidePosition(position: BoardPosition<PositionType>): string[] {
    // main x/y: w/h; buffer x/y: c - w/h
    // TODO: implement this properly
    return this.getTopSidePosition(position);
  }
  private getTopSidePosition(position: BoardPosition<PositionType>): string[] {
    // main x/y: w/h; buffer x/y: c - w/h
    const height = this.config.cli.board.nonCornerPositionHeight;
    const width = this.config.cli.board.nonCornerPositionWidth;
    const bufferBottomHeight = this.config.cli.board.cornerPositionSize - height;
    const top = UTFChars.topHorizontalLine.repeat(width);
    const bottom = UTFChars.bottomHorizontalLine.repeat(width);
    const bottomSpacing = getBlankBox(bufferBottomHeight, width);
    const remainingLines = height - 2;
    const fillerLines = getLeftRightBorderBox(remainingLines, width);
    fillerLines[2] = padTextLeftRight(position.name, width);
    switch (position.type) {
      case PositionType.Blank:
      case PositionType.Chance:
      case PositionType.CommunityChest:
      case PositionType.GoToJail:
      case PositionType.Jail:
        break;
      case PositionType.Property: {
        const asProperty = position as BoardPosition<PositionType.Property>;
        const color = this.config.cli.board.colors[asProperty.color];
        const header = padTextLeftRight(color(UTFChars.solidBlock.repeat(width - 2)), width);
        fillerLines[0] = header;
        // TODO: display improvements?
        fillerLines[remainingLines - 2] = `Price: $${asProperty.basePrice}`;
        break;
      }
      case PositionType.Railroad: {
        const asRailroad = position as BoardPosition<PositionType.Railroad>;
        fillerLines[4] = padTextLeftRight("🚆", width);
        fillerLines[remainingLines - 2] = `Price: $${asRailroad.basePrice}`;
        break;
      }
      case PositionType.Tax: {
        const asTax = position as BoardPosition<PositionType.Tax>;
        fillerLines[4] = padTextLeftRight(asTax.icon, width);
        fillerLines[remainingLines - 2] = `Pay ${asTax.baseAmount}`;
        break;
      }
      case PositionType.Utility: {
        const asUtility = position as BoardPosition<PositionType.Utility>;
        fillerLines[4] = padTextLeftRight(asUtility.icon, width);
        fillerLines[remainingLines - 2] = `Price: $${asUtility.basePrice}`;
        break;
      }
      default:
        assertNever(position.type);
    }
    const lines = [top, ...fillerLines, bottom, ...bottomSpacing];
    return lines;
  }
  private getBottomSidePosition(position: BoardPosition<PositionType>): string[] {
    // main x/y: w/h; buffer x/y: c - w/h
    // TODO: implement this properly
    return this.getTopSidePosition(position);
  }
  private getCornerPosition(position: BoardPosition<PositionType>): string[] {
    const size = this.config.cli.board.cornerPositionSize;
    const top = UTFChars.topHorizontalLine.repeat(size);
    const bottom = UTFChars.bottomHorizontalLine.repeat(size);
    const remainingLines = size - 2;
    const fillerLines = getLeftRightBorderBox(remainingLines, size);
    fillerLines[2] = padTextLeftRight(position.name, size);
    switch (position.type) {
      case PositionType.Blank:
      case PositionType.GoToJail:
      case PositionType.Jail:
        // TODO: add an icon or something
        break;
      default:
        throw new Error("not a corner position");
    }
    return [top, ...fillerLines, bottom];
  }
  private getRowBetweenBoard(): string[] {
    const width =
      this.config.cli.board.nonCornerPositionWidth *
      this.boardConfig.totalNonCornerPositionsPerSide;
    const height = this.config.cli.board.nonCornerPositionWidth;
    return getBlankBox(height, width);
  }
  private getPosition(position: BoardPosition<PositionType>): string[] {
    const positionType = this.boardConfig.getSide(position.position);
    switch (positionType) {
      case "bottom":
        return this.getBottomSidePosition(position);
      case "corner":
        return this.getCornerPosition(position);
      case "left":
        return this.getLeftSidePosition(position);
      case "right":
        return this.getRightSidePosition(position);
      case "top":
        return this.getTopSidePosition(position);
    }
  }
  private getBoardConfig(): BoardConfig {
    const {
      config: { cli },
      game: {
        state: { board },
      },
    } = this;
    const length = board.positions.length;
    const sideLength = length / 4;
    if (!Number.isInteger(sideLength)) {
      throw new Error("board is not square");
    }
    const totalNonCornerPositionsPerSide = sideLength - 1;
    const totalCornerPositionsSize = cli.board.cornerPositionSize * 2;
    const totalNonCornerPositionsSize =
      cli.board.nonCornerPositionWidth * totalNonCornerPositionsPerSide;
    const totalHeightWidth = totalCornerPositionsSize + totalNonCornerPositionsSize;
    const getSide = (i: number) => {
      const sides = ["left", "top", "right", "bottom"] as const;
      for (let j = 0; j < 4; j++) {
        const corner1 = sideLength * j;
        const corner2 = sideLength * (j + 1);
        const side = sides[j];
        if (i > corner1 && i < corner2) {
          return side;
        }
      }
      return "corner";
    };
    return {
      totalHeightWidth,
      totalNonCornerPositions: length - 4,
      getSide,
      totalNonCornerPositionsPerSide,
    };
  }
  private mergeRendersIntoNewlineRows(rows: string[][][]): string[] {
    const singleCharacterRows: string[] = [];
    for (let i = 0; i < this.boardConfig.totalHeightWidth; i++) {
      singleCharacterRows[i] = " ".repeat(this.boardConfig.totalHeightWidth);
    }
    const topOrBottomRowHeight = this.config.cli.board.cornerPositionSize;
    const middleRowHeight = this.config.cli.board.nonCornerPositionWidth;
    const getBaseline = (i: number): number => {
      if (i === 0) {
        return 0;
      }
      if (i === 1) {
        return topOrBottomRowHeight;
      }
      return topOrBottomRowHeight + (i - 1) * middleRowHeight;
    };
    rows.forEach((row, i) => {
      const rowBaseline = getBaseline(i);
      row.forEach((position, j) => {
        const columnBaseline = getBaseline(j);
        position.forEach((line, k) => {
          Array.from(line).forEach((char, z) => {
            const rowIndex = rowBaseline + k;
            const columnIndex = columnBaseline + z;
            singleCharacterRows[rowIndex] = [
              ...singleCharacterRows[rowIndex].slice(0, columnIndex),
              char,
              ...singleCharacterRows[rowIndex].slice(columnIndex + 1),
            ].join("");
          });
        });
      });
    });
    return singleCharacterRows;
  }
  getBoardBase(): string {
    const {
      boardConfig,
      game: {
        state: { board },
      },
    } = this;
    const sideLength = length / 4;
    const leftSideRange: [number, number] = [1, sideLength - 1];
    const topRowRange: [number, number] = [sideLength, sideLength * 2];
    const rightSideRange: [number, number] = [sideLength * 2, sideLength * 3];
    const bottomRowRange: [number, number] = [sideLength * 3, sideLength * 4];
    const topRowPositions = board.positions.slice(topRowRange[0], topRowRange[1] + 1);
    const bottomRowPositions = [
      board.positions[0],
      ...board.positions.slice(bottomRowRange[0], bottomRowRange[1]).reverse(),
    ];
    const topRowRenders = topRowPositions.map(p => this.getPosition(p));
    const bottomRowRenders = bottomRowPositions.map(p => this.getPosition(p));
    const middleRowRenders: string[][][] = [];
    for (let i = 0; i < boardConfig.totalNonCornerPositionsPerSide; i++) {
      const leftPosition = leftSideRange[0] + leftSideRange[1] - i;
      const rightPosition = rightSideRange[0] + i;
      const between = this.getRowBetweenBoard();
      const left = this.getPosition(board.positions[leftPosition]);
      const right = this.getPosition(board.positions[rightPosition]);
      const row = [left, between, right];
      middleRowRenders.push(row);
    }
    const renders = [topRowRenders, ...middleRowRenders, bottomRowRenders];
    const merged = this.mergeRendersIntoNewlineRows(renders);
    const screen = merged.join("\n");
    return screen;
  }
  register(game: IGame) {
    this.game = game;
    this.boardConfig = this.getBoardConfig();
    this.boardBase = this.getBoardBase();
  }
  render(): string {
    const base = this.boardBase;
    // TODO: add property upgrades, player positions;
    return base;
  }
}

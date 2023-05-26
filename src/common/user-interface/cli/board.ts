import chalk, { Chalk } from "chalk";
import stringLength from "string-width";
import { BoardPosition, PositionType } from "common/board/types";
import { RuntimeConfig } from "common/config/types";
import { IGame } from "common/game/types";
import { assertNever } from "common/util";
import { Property } from "common/property/types";
import { IPlayer } from "common/player/types";

type BoardConfig = {
  totalHeightWidth: number;
  totalNonCornerPositions: number;
  totalNonCornerPositionsPerSide: number;
  getSide(i: number): "left" | "right" | "top" | "bottom" | "corner";
};

const UTFChars = {
  solidBlock: "█",
  space: " ",
  leftVerticalLine: "|",
  rightVerticalLine: "|",
  middleVerticalLine: "|",
  topHorizontalLine: "▁",
  middleHorizontalLine: "—",
  bottomHorizontalLine: "▔",
} as const;
function getBlankBox(height: number, width: number): string[] {
  const rows: string[] = [];
  for (let i = 0; i < height; i++) {
    rows.push(chalk.black(UTFChars.space.repeat(width)));
  }
  return rows;
}
function getLeftRightBorderBox(height: number, width: number): string[] {
  const rows: string[] = [];
  for (let i = 0; i < height; i++) {
    rows.push(
      UTFChars.leftVerticalLine + UTFChars.space.repeat(width - 2) + UTFChars.rightVerticalLine
    );
  }
  return rows;
}
function centerText(text: string, width: number, color?: Chalk): string {
  const len = stringLength(text);
  const extraWidth = width - len;
  const onEachSide = extraWidth / 2;
  const leftSpacing = Math.floor(onEachSide);
  const rightSpacing = Math.ceil(onEachSide);
  return (
    UTFChars.space.repeat(leftSpacing) +
    (color ? color(text) : text) +
    UTFChars.space.repeat(rightSpacing)
  );
}

function padTextLeftRight(text: string, width: number, color?: Chalk): string[] {
  const len = stringLength(text);
  let lines: string[] = [];
  const maxWidth = width - 2;
  if (len > maxWidth) {
    const split = text.split(" ");
    if (split.some(s => stringLength(s) > maxWidth)) {
      throw new Error(`text too long: '${text}' has length ${len}, which > ${maxWidth}`);
    }
    let currentLine = "";
    split.forEach(line => {
      const proposed = (currentLine ? currentLine + " " : "") + line;
      const proposedLength = stringLength(proposed);
      if (proposedLength <= maxWidth) {
        currentLine = proposed;
      } else {
        lines.push(currentLine);
        currentLine = line;
      }
    });
    if (currentLine) {
      lines.push(currentLine);
    }
  } else {
    lines = [text];
  }
  const left = chalk.reset(UTFChars.leftVerticalLine);
  const right = chalk.reset(UTFChars.rightVerticalLine);
  const linesOut = lines.map(line => chalk(left + centerText(line, maxWidth, color) + right));
  return linesOut;
}

function replaceLinesFromEnd(arr: string[], newLines: string[], end: number) {
  const start = arr.length - (end + newLines.length);
  replaceLinesFromStart(arr, newLines, start);
}

function replaceLinesFromStart(arr: string[], newLines: string[], start: number) {
  newLines.forEach((line, i) => {
    arr[i + start] = line;
  });
}

export class CliBoardDisplay {
  private game!: IGame;
  public boardConfig!: BoardConfig;
  private boardBase!: string[];
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
    const nameLines = padTextLeftRight(position.name, width);
    const playersAtPosition: IPlayer[] = [];
    const playerEmojis: string[] = [];
    this.game.state.playerTurnOrder.forEach(playerId => {
      const player = this.game.state.playerStore.get(playerId);
      if (player.isBank) {
        return;
      }
      if (player.position === position.position) {
        playersAtPosition.push(player);
        playerEmojis.push(player.emoji);
      }
    });
    replaceLinesFromEnd(fillerLines, padTextLeftRight(playerEmojis.join(" "), width), 5);
    replaceLinesFromStart(fillerLines, nameLines, 3);
    switch (position.type) {
      case PositionType.Blank:
      case PositionType.Chance:
      case PositionType.CommunityChest:
      case PositionType.GoToJail:
      case PositionType.Jail:
        break;
      case PositionType.Property: {
        const asProperty = position as BoardPosition<PositionType.Property>;
        const p = this.game.state.propertyStore.get(asProperty.propertyId) as Property;
        const color = this.config.cli.board.colors[asProperty.color];
        const header = padTextLeftRight(UTFChars.solidBlock.repeat(width - 2), width, color);
        replaceLinesFromStart(fillerLines, header, 0);
        replaceLinesFromStart(fillerLines, header, 1);
        replaceLinesFromStart(
          fillerLines,
          padTextLeftRight(this.config.cli.levels[p.level], width),
          2
        );
        // TODO: display improvements?
        replaceLinesFromEnd(
          fillerLines,
          padTextLeftRight(`Price: $${asProperty.basePrice}`, width),
          2
        );
        if (!p.owner.startsWith("Bank_")) {
          const ownedBy = padTextLeftRight(`Owned by: ${p.owner}`, width);
          replaceLinesFromEnd(fillerLines, ownedBy, 0);
        }
        break;
      }
      case PositionType.Railroad: {
        const asRailroad = position as BoardPosition<PositionType.Railroad>;
        const p = this.game.state.propertyStore.get(asRailroad.propertyId);
        replaceLinesFromStart(fillerLines, padTextLeftRight("🚆", width), 5);
        replaceLinesFromEnd(
          fillerLines,
          padTextLeftRight(`Price: $${asRailroad.basePrice}`, width),
          2
        );
        if (!p.owner.startsWith("Bank_")) {
          const ownedBy = padTextLeftRight(`Owned by: ${p.owner}`, width);
          replaceLinesFromEnd(fillerLines, ownedBy, 0);
        }
        break;
      }
      case PositionType.Tax: {
        const asTax = position as BoardPosition<PositionType.Tax>;
        replaceLinesFromStart(fillerLines, padTextLeftRight(asTax.icon, width), 5);
        replaceLinesFromEnd(fillerLines, padTextLeftRight(`Pay ${asTax.baseAmount}`, width), 2);
        break;
      }
      case PositionType.Utility: {
        const asUtility = position as BoardPosition<PositionType.Utility>;
        const p = this.game.state.propertyStore.get(asUtility.propertyId);
        replaceLinesFromStart(fillerLines, padTextLeftRight(asUtility.icon, width), 5);
        replaceLinesFromEnd(
          fillerLines,
          padTextLeftRight(`Price: $${asUtility.basePrice}`, width),
          2
        );
        if (!p.owner.startsWith("Bank_")) {
          const ownedBy = padTextLeftRight(`Owned by: ${p.owner}`, width);
          replaceLinesFromEnd(fillerLines, ownedBy, 0);
        }
        break;
      }
      default:
        assertNever(position.type);
    }
    const lines = [top, ...fillerLines, bottom, ...bottomSpacing];
    const heightIsCorrect = lines.length === height;
    if (!heightIsCorrect) {
      throw new Error(
        `height is incorrect for position ${position.position} (${position.name}): expected ${height}, got ${lines.length}`
      );
    }
    const widthIsCorrect = lines.every(l => stringLength(l) === width);
    if (!widthIsCorrect) {
      const msgs: string[] = [];
      lines.forEach((line, i) => {
        const strLen = stringLength(line);
        if (strLen !== width) {
          msgs.push(`line ${i}: has length ${strLen}. value: '${line}'`);
        }
      });
      throw new Error(
        `width is incorrect for position ${position.position} (${
          position.name
        }): expected ${width}, got ${msgs.join(",\n")}`
      );
    }
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
    const nameLines = padTextLeftRight(position.name, size);
    const playersAtPosition: IPlayer[] = [];
    const playerEmojis: string[] = [];
    this.game.state.playerTurnOrder.forEach(playerId => {
      const player = this.game.state.playerStore.get(playerId);
      if (player.isBank) {
        return;
      }
      if (player.position === position.position) {
        playersAtPosition.push(player);
        playerEmojis.push(player.emoji);
      }
    });
    replaceLinesFromEnd(fillerLines, padTextLeftRight(playerEmojis.join(" "), size), 5);
    replaceLinesFromStart(fillerLines, nameLines, 2);
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
    for (let i = 0; i <= this.boardConfig.totalHeightWidth; i++) {
      singleCharacterRows[i] = "";
    }
    const topOrBottomRowHeight = this.config.cli.board.cornerPositionSize;
    const middleRowHeight = this.config.cli.board.nonCornerPositionWidth;
    const getBaseline = (i: number): number => {
      if (i === 0) {
        return 0;
      }
      return topOrBottomRowHeight + (i - 1) * middleRowHeight;
    };
    rows.forEach((row, i) => {
      const rowBaseline = getBaseline(i);
      row.forEach((position, j) => {
        position.forEach((line, k) => {
          const rowIndex = rowBaseline + k;
          singleCharacterRows[rowIndex] += line;
        });
      });
    });
    return singleCharacterRows;
  }
  getBoardBase(): string[] {
    const {
      boardConfig,
      game: {
        state: { board },
      },
    } = this;
    const length = board.positions.length;
    const sideLength = length / 4;
    const leftSideRange: [number, number] = [1, sideLength - 2];
    const topRowRange: [number, number] = [sideLength, sideLength * 2];
    const rightSideRange: [number, number] = [sideLength * 2 + 1, sideLength * 3];
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
    // renders.forEach(r=>{
    //     r.forEach(pos=>{
    //         console.log(pos.join("\n"))
    //     })
    // })
    const merged = this.mergeRendersIntoNewlineRows(renders);
    return merged;
  }
  register(game: IGame) {
    this.game = game;
    this.boardConfig = this.getBoardConfig();
    this.boardBase = this.getBoardBase();
  }
  render(): string[] {
    const base = this.boardBase;
    // TODO: add property upgrades, player positions;
    return base.map(x => chalk.visible(x));
    // return []
  }
}

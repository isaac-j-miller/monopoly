export type XYCoordinates = {
  x: number;
  y: number;
};

export type Orientation = "left" | "right" | "top" | "bottom" | "corner";

export type OrientationPositionAndSize = {
  orientation: Orientation;
  position: XYCoordinates;
  size: XYCoordinates;
};

const isInRange = (range: [number, number], value: number): boolean => {
  return range[0] <= value && range[1] >= value;
};

const getCornerSize = (): XYCoordinates => {
  return {
    x: 160,
    y: 160,
  };
};
const getNonCornerSize = (): XYCoordinates => {
  return {
    x: 100,
    y: 140,
  };
};

export class BoardSize {
  public readonly sideLength: number;
  private leftSideRange: [number, number];
  private topRowRange: [number, number];
  private rightSideRange: [number, number];
  private bottomRowRange: [number, number];
  private cornerSize: XYCoordinates;
  private nonCornerSize: XYCoordinates;
  private outerSize: number;
  private innerSize: number;
  private sideLengthCount: number;
  constructor(public readonly positions: number) {
    this.sideLengthCount = positions / 4;
    this.leftSideRange = [1, this.sideLengthCount - 1];
    this.topRowRange = [this.sideLengthCount + 1, this.sideLengthCount * 2 - 1];
    this.rightSideRange = [this.sideLengthCount * 2 + 1, this.sideLengthCount * 3 - 1];
    this.bottomRowRange = [this.sideLengthCount * 3 + 1, this.sideLengthCount * 4 - 1];
    this.nonCornerSize = getNonCornerSize();
    this.cornerSize = getCornerSize();
    this.outerSize = this.cornerSize.x;
    this.innerSize = this.nonCornerSize.x;
    this.sideLength = this.outerSize * 2 + this.innerSize * (this.sideLengthCount - 1);
  }
  getOrientationPositionAndSizeFromPosition(position: number): OrientationPositionAndSize {
    const {
      sideLength,
      leftSideRange,
      topRowRange,
      rightSideRange,
      bottomRowRange,
      cornerSize,
      nonCornerSize,
      outerSize,
      innerSize,
    } = this;
    let orientation: Orientation;
    let width: number;
    let height: number;
    let x: number;
    let y: number;
    width = nonCornerSize.x;
    height = nonCornerSize.y;
    const shift = (nonCornerSize.y - nonCornerSize.x) / 2;
    if (isInRange(leftSideRange, position)) {
      orientation = "left";
      const relativePosition = 1 + position - leftSideRange[0];
      x = shift;
      y = cornerSize.y + (leftSideRange[1] - relativePosition) * innerSize - shift;
    } else if (isInRange(topRowRange, position)) {
      orientation = "top";
      const relativePosition = position - topRowRange[0];
      x = cornerSize.x + relativePosition * innerSize;
      y = 0;
    } else if (isInRange(rightSideRange, position)) {
      orientation = "right";
      const relativePosition = position - rightSideRange[0];
      x = sideLength - outerSize + (cornerSize.x - width) - shift;
      y = outerSize + relativePosition * innerSize - shift;
    } else if (isInRange(bottomRowRange, position)) {
      orientation = "bottom";
      const relativePosition = bottomRowRange[1] - position;
      x = cornerSize.x + relativePosition * innerSize;
      y = sideLength - outerSize + (cornerSize.y - height);
    } else {
      orientation = "corner";
      width = cornerSize.x;
      height = cornerSize.y;
      if (position === 0) {
        // bottom left
        x = 0;
        y = sideLength - cornerSize.y;
      } else if (position === this.sideLengthCount) {
        // top left
        x = 0;
        y = 0;
      } else if (position === this.sideLengthCount * 2) {
        // top right
        x = sideLength - cornerSize.x;
        y = 0;
      } else if (position === this.sideLengthCount * 3) {
        // bottom right
        x = sideLength - cornerSize.x;
        y = sideLength - cornerSize.y;
      } else {
        throw new Error(`invalid position: ${position} is not on the board`);
      }
    }
    const result = {
      orientation,
      position: { x, y },
      size: orientation === "corner" ? cornerSize : nonCornerSize,
    };
    return result;
  }
}

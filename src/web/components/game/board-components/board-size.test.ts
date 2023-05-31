import { describe, it } from "node:test";
import { BoardSize } from "./generic";
import assert from "node:assert";

describe("BoardSize", () => {
  const boardSize = new BoardSize(40);
  it("calculates corners correctly", () => {
    const bottomLeft = boardSize.getOrientationPositionAndSizeFromPosition(0);
    assert.strictEqual(bottomLeft.orientation, "corner");
    const topLeft = boardSize.getOrientationPositionAndSizeFromPosition(10);
    assert.strictEqual(topLeft.orientation, "corner");
    const topRight = boardSize.getOrientationPositionAndSizeFromPosition(20);
    assert.strictEqual(topRight.orientation, "corner");
    const bottomRight = boardSize.getOrientationPositionAndSizeFromPosition(30);
    assert.strictEqual(bottomRight.orientation, "corner");
  });
  it("calculates sides correctly (left)", () => {
    const min = boardSize.getOrientationPositionAndSizeFromPosition(1);
    const middle = boardSize.getOrientationPositionAndSizeFromPosition(5);
    const max = boardSize.getOrientationPositionAndSizeFromPosition(9);
    assert.strictEqual(min.orientation, "left");
    assert.strictEqual(middle.orientation, "left");
    assert.strictEqual(max.orientation, "left");
  });
  it("calculates sides correctly (top)", () => {
    const min = boardSize.getOrientationPositionAndSizeFromPosition(11);
    const middle = boardSize.getOrientationPositionAndSizeFromPosition(15);
    const max = boardSize.getOrientationPositionAndSizeFromPosition(19);
    assert.strictEqual(min.orientation, "top");
    assert.strictEqual(middle.orientation, "top");
    assert.strictEqual(max.orientation, "top");
  });
  it("calculates sides correctly (right)", () => {
    const min = boardSize.getOrientationPositionAndSizeFromPosition(21);
    const middle = boardSize.getOrientationPositionAndSizeFromPosition(25);
    const max = boardSize.getOrientationPositionAndSizeFromPosition(29);
    assert.strictEqual(min.orientation, "right");
    assert.strictEqual(middle.orientation, "right");
    assert.strictEqual(max.orientation, "right");
  });
  it("calculates sides correctly (bottom)", () => {
    const min = boardSize.getOrientationPositionAndSizeFromPosition(31);
    const middle = boardSize.getOrientationPositionAndSizeFromPosition(35);
    const max = boardSize.getOrientationPositionAndSizeFromPosition(39);
    assert.strictEqual(min.orientation, "bottom");
    assert.strictEqual(middle.orientation, "bottom");
    assert.strictEqual(max.orientation, "bottom");
  });
});

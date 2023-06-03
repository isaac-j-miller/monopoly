import { describe, it } from "node:test";
import { calculateLoanTermFromAmountPaymentAndRate } from "./util";
import assert from "node:assert";
import { getRuntimeConfig } from "common/config";

describe("Loan Term Calculation", () => {
  const config = getRuntimeConfig();
  it("lower bound", () => {
    const term = calculateLoanTermFromAmountPaymentAndRate(1000, 0.05, 0);
    assert.strictEqual(term, config.runtime.maxLoanTerm);
  });
  it("upper bound", () => {
    const term = calculateLoanTermFromAmountPaymentAndRate(1000, 0.05, 1000);

    assert.strictEqual(term, config.runtime.minLoanTerm);
  });
  it("middle 1", () => {
    const term = calculateLoanTermFromAmountPaymentAndRate(1000, 0.05, 50);
    assert.strictEqual(term, 40);
  });
  it("middle 2", () => {
    const term = calculateLoanTermFromAmountPaymentAndRate(1000, 0.05, 89);
    assert.strictEqual(term, 17);
  });
});

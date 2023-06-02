import { describe, it } from "node:test";
import assert from "node:assert";
import { CreditRatingParams, calculateCreditRating } from "./util";
import { CreditRating } from "common/state/types";

describe("Credit Rating Calculations", () => {
  describe("AAA", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 0,
        loanExpensesPerTurn: 0,
        nonLoanExpensesPerTurn: 20,
        incomePerTurn: 500,
        totalAssets: 3000,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.AAA);
    });
  });
  describe("AA", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 500,
        loanExpensesPerTurn: 20,
        nonLoanExpensesPerTurn: 20,
        incomePerTurn: 500,
        totalAssets: 2000,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.AA);
    });
  });
  describe("A", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 1200,
        loanExpensesPerTurn: 50,
        nonLoanExpensesPerTurn: 20,
        incomePerTurn: 500,
        totalAssets: 2500,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.A);
    });
  });
  describe("BBB", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 2000,
        loanExpensesPerTurn: 80,
        nonLoanExpensesPerTurn: 30,
        incomePerTurn: 700,
        totalAssets: 2200,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.BBB);
    });
  });
  describe("BB", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 2500,
        loanExpensesPerTurn: 125,
        nonLoanExpensesPerTurn: 30,
        incomePerTurn: 700,
        totalAssets: 2100,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.BB);
    });
  });
  describe("B", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 3000,
        loanExpensesPerTurn: 150,
        nonLoanExpensesPerTurn: 30,
        incomePerTurn: 700,
        totalAssets: 2000,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.B);
    });
  });
  describe("CCC", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 4000,
        loanExpensesPerTurn: 250,
        nonLoanExpensesPerTurn: 30,
        incomePerTurn: 700,
        totalAssets: 2000,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.CCC);
    });
  });
  describe("CC", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 5000,
        loanExpensesPerTurn: 300,
        nonLoanExpensesPerTurn: 30,
        incomePerTurn: 700,
        totalAssets: 2200,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.CC);
    });
  });
  describe("C", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 7000,
        loanExpensesPerTurn: 400,
        nonLoanExpensesPerTurn: 100,
        incomePerTurn: 800,
        totalAssets: 2800,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.C);
    });
  });
  describe("D", () => {
    it("case 1", () => {
      const params: CreditRatingParams = {
        totalDebt: 17000,
        loanExpensesPerTurn: 1300,
        nonLoanExpensesPerTurn: 100,
        incomePerTurn: 0,
        totalAssets: 0,
      };
      const rating = calculateCreditRating(params);
      assert.strictEqual(rating, CreditRating.D);
    });
  });
});

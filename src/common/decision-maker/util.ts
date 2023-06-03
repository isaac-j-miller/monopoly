import { getRuntimeConfig } from "common/config";
import { CreditRating } from "common/state/types";

const normalizeCreditRating = (rating: CreditRating): number => {
  const normalized = (rating - CreditRating.D) / (CreditRating.AAA - CreditRating.D);
  return normalized;
};

const deNormalizeCreditRating = (normalizedRating: number): CreditRating => {
  const deNormalized = Math.floor(
    normalizedRating * CreditRating.AAA - normalizedRating * CreditRating.D
  );
  if (deNormalized < CreditRating.D) {
    return CreditRating.D;
  }
  if (deNormalized > CreditRating.AAA) {
    return CreditRating.AAA;
  }
  return deNormalized;
};

export const getCreditRatingBuySellPriceMultiplier = (rating: CreditRating): number => {
  const normal = normalizeCreditRating(rating);
  return (normal + 1) * 0.75;
};

export type CreditRatingParams = {
  totalDebt: number;
  loanExpensesPerTurn: number;
  nonLoanExpensesPerTurn: number;
  incomePerTurn: number;
  totalAssets: number;
};

export const calculateCreditRating = (params: CreditRatingParams): CreditRating => {
  // TODO: review this to make sure it at least makes some sense
  const { totalDebt, loanExpensesPerTurn, incomePerTurn, totalAssets, nonLoanExpensesPerTurn } =
    params;
  const totalExpensesPerTurn = loanExpensesPerTurn + nonLoanExpensesPerTurn;
  const netIncomePerTurn = incomePerTurn - loanExpensesPerTurn;
  const netIncomePerTurnDividedByAssets = netIncomePerTurn / totalAssets;
  const leverage = totalDebt / totalAssets;
  const expectedExpensesDividedByAssets = totalExpensesPerTurn / totalAssets;
  let score = 0.5;
  if (totalAssets > 0) {
    score -= leverage / 10;
    score += totalAssets / 5000;
    score += netIncomePerTurnDividedByAssets / 5;
    score -= expectedExpensesDividedByAssets / 100;
  } else {
    score -= 0.2;
  }
  if (incomePerTurn !== 0) {
    const debtToIncomeRatio = totalDebt / incomePerTurn;
    const inverseDebtToIncome = (1 - debtToIncomeRatio) / 10;
    score += inverseDebtToIncome;
  } else {
    score -= 0.2;
  }
  if (Number.isNaN(score)) {
    throw new Error("credit rating is NaN");
  }
  const asRating = deNormalizeCreditRating(score);
  return asRating;
};

const config = getRuntimeConfig();

export const calculateLoanTermFromAmountPaymentAndRate = (
  amount: number,
  rate: number,
  preferredPaymentPerTurn: number
): number => {
  if (preferredPaymentPerTurn <= 0) {
    return config.runtime.maxLoanTerm;
  }
  if (preferredPaymentPerTurn >= amount) {
    return config.runtime.minLoanTerm;
  }
  const insideLog = preferredPaymentPerTurn / rate / (preferredPaymentPerTurn / rate - amount);
  if (insideLog < 0) {
    // this means the loan will never be paid off
    return config.runtime.maxLoanTerm;
  }
  const numerator = Math.log(insideLog);

  const denominator = Math.log(1 + rate);
  const floatResult = numerator / denominator;
  const rounded = Math.ceil(floatResult);
  if (rounded > config.runtime.maxLoanTerm) {
    return config.runtime.maxLoanTerm;
  }
  if (rounded < config.runtime.minLoanTerm) {
    return config.runtime.minLoanTerm;
  }
  return rounded;
};

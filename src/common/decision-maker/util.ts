import { CreditRating } from "common/state/types";

const normalizeCreditRating = (rating: CreditRating): number => {
  const normalized = (rating - CreditRating.D) / (CreditRating.AAA - CreditRating.D);
  return normalized;
};

export const getCreditRatingBuySellPriceMultiplier = (rating: CreditRating): number => {
  const normal = normalizeCreditRating(rating);
  return normal * 1.5;
};

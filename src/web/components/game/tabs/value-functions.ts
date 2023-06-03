import { SocketStateUpdate } from "common/state/socket";
import { assertNever } from "common/util";
import { getNominalPaymentAmount } from "common/loan";
import { calculateExpectedReturnOnPropertyPerTurn } from "common/events/util";
import { getStateFromSnapshot } from "src/web/game/snapshot";
import { getRuntimeConfig } from "common/config";

export const getTotalDebt = (snapshot: SocketStateUpdate): number => {
  let debt = 0;
  Object.values(snapshot.loans).forEach(loan => {
    debt += loan.remainingInterest + loan.remainingPrincipal;
  });
  return debt;
};
const config = getRuntimeConfig();
const getTotalIncome = (snapshot: SocketStateUpdate): number => {
  let income = 0;
  Object.values(snapshot.loans).forEach(loan => {
    const amt = loan.remainingInterest + loan.remainingPrincipal;
    if (amt <= 0) {
      return;
    }
    const payment = getNominalPaymentAmount(amt, loan.term, loan.rate);
    income += payment;
  });
  Object.values(snapshot.properties).forEach(property => {
    if (property.owner.startsWith("Bank_")) {
      return;
    }
    const state = getStateFromSnapshot(snapshot);
    const expectedIncome = calculateExpectedReturnOnPropertyPerTurn(
      state,
      property.propertyId,
      property.owner
    );
    income += expectedIncome;
  });
  snapshot.playerTurnOrder.forEach(() => {
    income += config.runtime.passGoAmount;
  });
  return income;
};

export const getTotalDebtAndIncome = (key: string, snapshot: SocketStateUpdate): number => {
  const asKey = key as "debt" | "income";
  switch (asKey) {
    case "debt":
      return getTotalDebt(snapshot);
    case "income":
      return getTotalIncome(snapshot);
    default:
      assertNever(asKey);
  }
  throw new Error("somehow fell through");
};

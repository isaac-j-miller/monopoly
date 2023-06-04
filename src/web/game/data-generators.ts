import { calculateExpectedReturnOnPropertyPerTurn } from "common/events/util";
import { getNominalPaymentAmount } from "common/loan";
import { getRuntimeConfig } from "common/config";
import { getStateFromSnapshot } from "./snapshot";
import { DataGenerator, DataPoint } from "./snapshot-processor";
import { getCurrentAverageInterestRate } from "common/property/upgrades";
import { PositionType } from "common/board/types";
import { assertNever } from "common/util";
import { getTotalDebt, getTotalIncome } from "./value-functions";

const config = getRuntimeConfig();
const debtVsIncome: DataGenerator = {
    name: "debt-vs-income",
    getDatapoint: snapshot => {
        let debt = 0;
        Object.values(snapshot.loans).forEach(loan => {
            debt += loan.remainingInterest + loan.remainingPrincipal;
        });
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
        return {
            x: snapshot.turn,
            debt,
            income
        }
    }
}

const loanInterestRate: DataGenerator = {
    name: "avg-loan-rate",
    getDatapoint: snapshot => {
        const weighted =  getCurrentAverageInterestRate(Object.values(snapshot.loans), true);
        const unweighted = getCurrentAverageInterestRate(Object.values(snapshot.loans), false);
        return {
            x: snapshot.turn,
            weighted, 
            unweighted
        }
    }
}

const netWorth: DataGenerator = {
    name: "net-worth",
    getDatapoint: snapshot => {
        const point: DataPoint = {
            x: snapshot.turn
        }
        Object.entries(snapshot.players).forEach(([playerId, player]) => {
            point[playerId] = player.netWorth;
        })
        return point
    }
}

const cashOnHand: DataGenerator = {
    name: "cash-on-hand",
    getDatapoint: snapshot => {
        const point: DataPoint = {
            x: snapshot.turn
        }
        Object.entries(snapshot.players).forEach(([playerId, player]) => {
            point[playerId] = player.cashOnHand;
        })
        return point
    }
}
const creditRating: DataGenerator = {
    name: "credit-rating",
    getDatapoint: snapshot => {
        const point: DataPoint = {
            x: snapshot.turn
        }
        Object.entries(snapshot.players).forEach(([playerId, player]) => {
            point[playerId] = player.creditRating;
        })
        return point
    }
}
const propertyValueDebtIncome: DataGenerator = {
    name: "property-value-debt-income",
    getDatapoint: snapshot => {
        const point: DataPoint = {
            x: snapshot.turn
        }
        let propertyValue = 0;
        let railroadValue = 0;
        let utilityValue = 0;
        let propertyCount = 0;
        let railroadCount = 0;
        let utilityCount = 0;
        Object.values(snapshot.properties).forEach(property => {
            switch(property.propertyType) {
                case PositionType.Property:
                    propertyValue += property.marketValue;
                    propertyCount++;
                    break;
                case PositionType.Railroad:
                    railroadValue+=property.marketValue;
                    railroadCount++;
                    break;
                case PositionType.Utility:
                    utilityValue+=property.marketValue;
                    utilityCount++;
                    break;
                default:
                    assertNever(property);
            }
        })
        point.debt = getTotalDebt(snapshot);
        point.income = getTotalIncome(snapshot);
        point.debtToIncomeRatio = point.debt/point.income;
        point.propertyAvg = propertyValue/propertyCount;
        point.property = propertyValue
        point.railroadAvg = railroadValue/railroadCount;
        point.railroad = railroadValue
        point.utilityAvg = utilityValue/utilityCount;
        point.utility = utilityValue
        point.total = propertyValue + railroadValue + utilityValue
        point.avg = (propertyValue * propertyCount + railroadValue * railroadCount + utilityValue * utilityCount)/(utilityCount+propertyCount+railroadCount)
        return point;
    }
}
// TODO: write datagenerators
export const dataGenerators: DataGenerator[] = [
    debtVsIncome,
    loanInterestRate,
    netWorth,
    cashOnHand,
    creditRating,
    propertyValueDebtIncome
];
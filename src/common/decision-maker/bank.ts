import { LoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { InterestRateType, PlayerId } from "common/state/types";
import { IDecisionMaker } from "./types";
import { DecisionMakerBase } from "./base";

export class BankDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
    async takeTurn(): Promise<void> {
        // the bank doesn't take turns
        return;
    }
    async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
        // TODO: implement
        return false;
    }
    async getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote | null> {
        const player = this.game.state.playerStore.get(playerId);
        const { creditRating } = player;
        const {creditRatingLendingThreshold} = this.player;
        if(creditRating < creditRatingLendingThreshold) {
            return null;
        }
        const interestRate = this.config.bank.startingInterestRate;
        const multiplier = this.config.credit.ratingMultiplierOnInterest[creditRating];
        const rate = interestRate * multiplier;
        const quote: LoanQuote = {
            // TODO: figure out variable rate loans
            rateType: InterestRateType.Fixed,
            amount,
            creditor: this.player.id,
            debtor: playerId,
            rate,
            // TODO: figure out how to determine an acceptable term
            term: 20
        }
        return quote;
    }
    async getPurchasePropertyQuoteForPlayer(playerId: PlayerId, propertyId: number): Promise<PropertyQuote | null> {
        const property = this.game.state.propertyStore.get(propertyId);
        if(property.owner !== this.player.id) {
            return null;
        }
        const quote: PropertyQuote = {
            ...property,
            offer: property.realValue,
            for: playerId
        }
        return quote
    }
    async decideToBuyPropertyFromBank(): Promise<boolean> {
        // the bank can't buy property from the bank
        return false;
    }
}
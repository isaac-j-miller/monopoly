import { PropertyQuote } from "common/property/types";
import { InterestRateType, PlayerId } from "common/state/types";
import { LoanQuote } from "common/loan/types";
import { IDecisionMaker } from "./types";
import { DecisionMakerBase } from "./base";
import { BoardPosition, PositionType } from "common/board/types";

export class ComputerDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
    async takeTurn(): Promise<void> {
        // TODO: implement
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
        if(this.player.cashOnHand < amount) {
            // TODO: take out lower rate interest loan to cover, if it is profitable
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
        const position = this.player.position;
        const boardPosition = this.game.state.board.positions[position];
        if(boardPosition.type === PositionType.Property|| boardPosition.type===PositionType.Railroad||boardPosition.type === PositionType.Utility) {
            const p = boardPosition as BoardPosition<PositionType.Property|PositionType.Railroad|PositionType.Utility>;
            const property = this.game.state.propertyStore.get(p.propertyId);
            const owner = this.game.state.playerStore.get(property.owner);
            if(!owner.isBank) {
                return false;
            }
            const quote = await owner.getPurchasePropertyQuoteForPlayer(this.player.id, property.propertyId);
            if(!quote) {
                return false
            }
            if(quote.offer < this.player.cashOnHand) {
                return true;
            }
            const loanOffers = await this.player.getLoanQuotesFromOtherPlayers(quote.offer);
            if(loanOffers.length > 0) {
                return true;
            }
        }
        return false;
    }
}
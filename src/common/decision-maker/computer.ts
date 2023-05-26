import { Property, PropertyLevel, PropertyQuote } from "common/property/types";
import { CreditRating, InterestRateType, PlayerId } from "common/state/types";
import { LoanId, LoanQuote, TransferLoanQuote } from "common/loan/types";
import { BoardPosition, PositionType, PropertyColor } from "common/board/types";
import { getInterestRateForLoanQuote, getLoanQuoteFaceValue } from "common/loan";
import { getUpgradeCost } from "common/property/upgrades";
import { IDecisionMaker } from "./types";
import { DecisionMakerBase } from "./base";
import { getCreditRatingBuySellPriceMultiplier } from "./util";

export class ComputerDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
  async doOptionalActions(): Promise<void> {
    // TODO: decide whether to pay down debt, play chance/chest card, purchase upgrades to properties, and purchase properties/loans from other players
    const properties = this.player.properties;
    const allPropertyProperties = this.game.state.board
      .getAllPositionsOfType(PositionType.Property)
      .filter(p => properties.has(p.propertyId));
    allPropertyProperties.forEach(property => {
      const { color } = property;
      const propertiesOfColor = this.game.state.board
        .getAllPropertiesOfColor(color)
        .map(p => p.propertyId);
      if (propertiesOfColor.every(id => properties.has(id))) {
        // if we have a monopoly on this color, start upgrading
        propertiesOfColor.forEach(propertyId => {
          const property = this.game.state.propertyStore.get(propertyId) as Property;
          if (property.level < PropertyLevel.Skyscraper) {
            const upgradeCost = getUpgradeCost(property, property.level + 1);
            if (this.player.cashOnHand > upgradeCost) {
              this.player.upgradeProperty(property.propertyId, property.level + 1);
            }
            // TODO: add some more conditions, maybe take out a loan to do this
          }
        });
      } else {
        // TODO: try to buy some of the other properties of this color
      }
    });
  }
  async decideToAcceptTransferLoanQuote(
    quote: TransferLoanQuote,
    coverShortfallRound?: number
  ): Promise<boolean> {
    if (quote.creditor === this.player.id) {
      // we are selling one of our own loans;
      const [_ratingAdjustedValue, faceValue] = this.getValueOfLoanToPlayer(
        quote.loanId,
        coverShortfallRound
      );
      return quote.offer > faceValue;
    }
    // we are buying someone else's loan
    const [ratingAdjustedValue] = this.getValueOfLoanToPlayer(quote.loanId);
    return quote.offer <= ratingAdjustedValue;
  }
  private async coverCashOnHandShortfallInternal(round: number) {
    // if we couldn't take out any loans to cover our cash shortfall, try selling some loans
    const loanValues = Array.from(this.player.creditLoans).map(loanId => {
      const [sortValue, faceValue] = this.getValueOfLoanToPlayer(loanId, round);
      return [sortValue, faceValue, loanId] as const;
    });
    const sortedLoanValues = loanValues.sort((a, b) => a[0] - b[0]);
    for await (const [_sortValue, faceValue, loanId] of sortedLoanValues) {
      const quotes = await this.player.getTransferLoanOffersFromOtherPlayers(loanId, faceValue);
      if (quotes.length > 0) {
        const bestQuote = quotes.sort((a, b) => b.offer - a.offer)[0];
        if (await this.decideToAcceptTransferLoanQuote(bestQuote)) {
          this.player.sellLoan(bestQuote);
          if (this.player.cashOnHand >= 0) {
            break;
          }
        }
      }
    }
    if (this.player.cashOnHand >= 0) {
      return;
    }
    // if we couldn't sell a loan, try selling properties
    const propertyValues = Array.from(this.player.properties).map(propertyId => {
      const value = this.getValueOfPropertyToPlayer(propertyId, round);
      return [propertyId, value] as const;
    });
    const sorted = propertyValues.sort(([aId, aValue], [bId, bValue]) => {
      return aValue - bValue;
    });
    for await (const [propertyId, value] of sorted) {
      const quotes = await this.player.getSellPropertyQuotesFromOtherPlayers(propertyId, value);
      if (quotes.length > 0) {
        const bestQuote = quotes.sort((a, b) => b.offer - a.offer)[0];
        if (await this.decideToAcceptPropertyQuote(bestQuote)) {
          this.player.sellProperty(bestQuote);
          if (this.player.cashOnHand >= 0) {
            break;
          }
        }
      }
    }
    // TODO: try downgrading properties
  }
  async coverCashOnHandShortfall(): Promise<void> {
    // need to get a loan or sell a property
    await this.player.handleFinanceOption(
      this.player.cashOnHand * -1 + 1,
      "negative cash on hand balance"
    );
    let round = 0;
    while (this.player.cashOnHand < 0) {
      if (round > 20) {
        break;
      }
      await this.coverCashOnHandShortfallInternal(round);
      round++;
    }
    if (this.player.cashOnHand < 0) {
      throw new Error("figure out how to declare bankruptcy");
      // TODO: figure out how to declare bankruptcy
    }
  }
  async decideHowToFinancePayment(amount: number): Promise<LoanQuote | null> {
    if (
      this.player.cashOnHand < amount ||
      (this.player.creditRating >= CreditRating.AA && amount > this.player.cashOnHand * 0.5)
    ) {
      const loanQuotes = await this.player.getLoanQuotesFromOtherPlayers(amount);
      const bestLoanQuote = loanQuotes.sort((a, b) => {
        // TODO: determine a more situationally-aware method of determining the "best" loan
        return a.rate - b.rate;
      })[0];
      if (bestLoanQuote === undefined) {
        // no one will offer a loan, meaning we will use cash if we have it, possibly incurring a negative balance which must be
        // resolved by selling assets
        return null;
      }
      return bestLoanQuote;
    }
    return null;
  }
  async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
    return this.player.getOutOfJailFreeCards > 0;
  }
  async decideToPayToGetOutOfJail(): Promise<boolean> {
    // TODO: make dependent on number of properties available, cash on hand, etc
    return false;
  }
  // ratingAdjustedValue, actualValue
  private getValueOfLoanToPlayer(
    loanId: LoanId,
    coverShortfallRound: number = 0
  ): [number, number] {
    const loan = this.game.state.loanStore.get(loanId);
    const debtor = this.game.state.playerStore.get(loan.debtor);
    const debtorCreditRating = debtor.creditRating;
    const faceValue = loan.getFaceValue();
    // TODO: add riskiness into calculation
    const ratingAdjustedValue =
      faceValue * this.config.credit.ratingMultiplierOnDebtAssetValue[debtorCreditRating];
    const shortfallMultiplier = 1 - 0.04 * coverShortfallRound;
    return [ratingAdjustedValue, faceValue * shortfallMultiplier];
  }
  private getValueOfPropertyToPlayer(propertyId: number, coverShortfallRound: number = 0): number {
    const property = this.game.state.propertyStore.get(propertyId);
    let color: PropertyColor | null = null;
    let totalOfType = 0;
    let totalOwnedOfType = 0;
    const { propertyType } = property;
    if (propertyType === PositionType.Property) {
      color = property.color;
      const allOfColor = this.game.state.board.getAllPropertiesOfColor(color);
      allOfColor.forEach(({ propertyId }) => {
        const property = this.game.state.propertyStore.get(propertyId);
        totalOfType++;
        if (property.owner === this.player.id) {
          totalOwnedOfType++;
        }
      });
    } else {
      const allOfType = this.game.state.board.getAllPositionsOfType(propertyType);
      allOfType.forEach(({ propertyId }) => {
        const property = this.game.state.propertyStore.get(propertyId);
        totalOfType++;
        if (property.owner === this.player.id) {
          totalOwnedOfType++;
        }
      });
    }
    const creditRating = this.player.creditRating;
    const monopolyMultiplier = 4 * (totalOwnedOfType / totalOfType);
    const { realValue } = property;
    const creditRatingMultiplier = getCreditRatingBuySellPriceMultiplier(creditRating);
    const shortfallMultiplier = 1 - 0.04 * coverShortfallRound;
    return realValue * monopolyMultiplier * creditRatingMultiplier * shortfallMultiplier;
  }
  async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
    const { propertyId, offer } = quote;
    const valueToAccept = this.getValueOfPropertyToPlayer(propertyId);
    if (quote.owner === this.player.id) {
      // this is a sell quote
      return offer >= valueToAccept;
    } else {
      // this is a buy quote
      return offer <= valueToAccept;
    }
  }
  async getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote | null> {
    const player = this.game.state.playerStore.get(playerId);
    const { creditRating } = player;
    const { creditRatingLendingThreshold } = this.player;
    if (creditRating < creditRatingLendingThreshold) {
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
      term: 20,
    };
    // TODO: add riskiness into calculation
    if (this.player.cashOnHand < amount * 2) {
      const loanOffers = await this.player.getLoanQuotesFromOtherPlayers(amount, [playerId]);
      const bestLoanOffer = loanOffers.sort(
        (a, b) => getLoanQuoteFaceValue(a) - getLoanQuoteFaceValue(b)
      )[0];
      if (!bestLoanOffer) {
        return null;
      }
      const bestLoanOfferValue = getLoanQuoteFaceValue(bestLoanOffer);
      // TODO: add riskiness into calculation
      const quoteInterestRate = getInterestRateForLoanQuote(amount, bestLoanOfferValue * 1.2);
      quote.rate = quoteInterestRate;
    }
    return quote;
  }
  async getPurchasePropertyQuoteForPlayer(
    playerId: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null> {
    const property = this.game.state.propertyStore.get(propertyId);
    if (property.owner !== this.player.id) {
      return null;
    }
    const quote: PropertyQuote = {
      ...property,
      offer: property.realValue,
      for: playerId,
    };
    return quote;
  }
  async decideToBuyPropertyFromBank(): Promise<boolean> {
    const position = this.player.position;
    const boardPosition = this.game.state.board.positions[position];
    if (
      boardPosition.type === PositionType.Property ||
      boardPosition.type === PositionType.Railroad ||
      boardPosition.type === PositionType.Utility
    ) {
      const p = boardPosition as BoardPosition<
        PositionType.Property | PositionType.Railroad | PositionType.Utility
      >;
      const property = this.game.state.propertyStore.get(p.propertyId);
      const owner = this.game.state.playerStore.get(property.owner);
      if (!owner.isBank) {
        return false;
      }
      const quote = await owner.getPurchasePropertyQuoteForPlayer(
        this.player.id,
        property.propertyId
      );
      if (!quote) {
        return false;
      }
      if (quote.offer < this.player.cashOnHand) {
        return true;
      }
      const loanOffers = await this.player.getLoanQuotesFromOtherPlayers(quote.offer);
      if (loanOffers.length > 0) {
        return true;
      }
    }
    return false;
  }
}

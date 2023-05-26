import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { PlayerId } from "common/state/types";
import { RuntimeConfig } from "common/config/types";
import { IUserInput } from "common/user-interface/types";
import { PositionType, PropertyTypeBase } from "common/board/types";
import { IDecisionMaker } from "./types";
import { DecisionMakerBase } from "./base";

export class CliHumanDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
  constructor(config: RuntimeConfig, private userInput: IUserInput) {
    super(config);
  }
  async doOptionalActions(): Promise<void> {
    // TODO: implement
  }
  async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
    const verb = quote.creditor === this.player.id ? "sell" : "buy";
    return this.userInput.promptBoolean(
      `Will you ${verb} this loan?:\n${Object.entries(quote)
        .map(([k, v]) => `\t${k}: ${v}`)
        .join("\n")}\n`
    );
  }
  async coverCashOnHandShortfall(): Promise<void> {
    // TODO: implement
  }
  async decideHowToFinancePayment(amount: number): Promise<LoanQuote | null> {
    // TODO: implement
    return null;
  }
  async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
    return this.userInput.promptBoolean(
      `You have ${this.player.getOutOfJailFreeCards}. would you like to use one?`
    );
  }
  async decideToPayToGetOutOfJail(): Promise<boolean> {
    return this.userInput.promptBoolean(
      `Would you like to pay $${this.config.jail.getOfJailBaseCost} to get out of jail?`
    );
  }
  async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
    const verb = quote.owner === this.player.id ? "sell" : "buy";
    return this.userInput.promptBoolean(
      `Will you ${verb} this property?:\n${Object.entries(quote)
        .map(([k, v]) => `\t${k}: ${v}`)
        .join("\n")}\n`
    );
  }
  async getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote | null> {
    // TODO: implement
    return null;
  }
  async getPurchasePropertyQuoteForPlayer(
    playerId: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null> {
    // TODO: implement
    return null;
  }
  async decideToBuyPropertyFromBank(): Promise<boolean> {
    const currentPosition = this.player.position;
    const pos = this.game.state.board.positions[currentPosition];
    if (
      pos.type === PositionType.Utility ||
      pos.type === PositionType.Railroad ||
      pos.type === PositionType.Property
    ) {
      const property = this.game.state.propertyStore.get((pos as PropertyTypeBase).propertyId);
      return this.userInput.promptBoolean(
        `Will you buy this property from the bank?:\n${Object.entries(property)
          .map(([k, v]) => `\t${k}: ${v}`)
          .join("\n")}\n`
      );
    }
    return false;
  }
}

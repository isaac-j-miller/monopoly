import { IGame } from "common/game/types";
import { BoardPosition, PositionType } from "common/board/types";
import { assertIsDefined, assertNever } from "common/util";
import {
  EventType,
  GameEvent,
  GetOutOfJailEvent,
  GetOutOfJailReason,
  LoanPaymentEvent,
  LoanTransferEvent,
  NullifyLoanEvent,
  PlayerDeclareBankruptcyEvent,
  PlayerMoveEvent,
  PropertyDowngradeEvent,
  PropertyTransferEvent,
  PropertyUpgradeEvent,
  RentPaymentEvent,
} from "common/events/types";
import { Property, PropertyLevel, Railroad, Utility } from "common/property/types";
import { determineRentPaymentAmount } from "common/events/util";
import { IPlayer } from "./types";
import { PlayerBase } from "./base";
import { PlayerId } from "common/state/types";
import { currencyFormatter } from "common/formatters/number";

export class Player extends PlayerBase implements IPlayer {
  upgradeProperty(propertyId: number, newLevel: PropertyLevel): void {
    // TODO: make sure that you actually can upgrade property by checking prerequisites
    const event: Omit<PropertyUpgradeEvent, "turn" | "order"> = {
      newLevel,
      propertyId,
      type: EventType.PropertyUpgrade,
    };
    this.game.processEvent(event);
  }
  sellPropertyUpgrades(propertyId: number, newLevel: PropertyLevel): void {
    const event: Omit<PropertyUpgradeEvent, "turn" | "order"> = {
      newLevel,
      propertyId,
      type: EventType.PropertyUpgrade,
    };
    this.game.processEvent(event);
  }
  private move() {
    const roll = this.mostRecentRoll;
    assertIsDefined(roll);
    const event: Omit<PlayerMoveEvent, "turn" | "order"> = {
      type: EventType.PlayerMove,
      delta: roll[0] + roll[1],
      player: this.id,
    };
    this.game.processEvent(event);
  }
  public get isBank(): boolean {
    return false;
  }
  register(game: IGame) {
    if (this.isRegistered) {
      return;
    }
    this.game = game;
    this.decisionMaker.register(game, this);
  }
  async takeTurn(): Promise<void> {
    console.debug(`${this.id} taking turn ${this.game.state.turn}...`);
    if (this.inJail) {
      if (this.state.getOutOfJailFreeCards > 0) {
        console.debug(`${this.id} deciding whether to use get out of jail free card...`);
        const shouldUseCard = await this.decisionMaker.decideToUseGetOutOfJailFreeCard();
        if (shouldUseCard) {
          const useCard: Omit<GetOutOfJailEvent, "turn" | "order"> = {
            player: this.id,
            reason: GetOutOfJailReason.Card,
            type: EventType.GetOutOfJail,
          };
          this.game.processEvent(useCard);
        }
      } else {
        console.debug(`${this.id} deciding whether to pay to get out of jail...`);
        const shouldPay = await this.decisionMaker.decideToPayToGetOutOfJail();
        if (shouldPay) {
          const useCard: Omit<GetOutOfJailEvent, "turn" | "order"> = {
            player: this.id,
            reason: GetOutOfJailReason.Pay,
            type: EventType.GetOutOfJail,
          };
          this.game.processEvent(useCard);
          await this.handleFinanceOption(
            this.config.jail.getOfJailBaseCost,
            "Pay to get out of jail"
          );
        }
      }
    }
    if (!this.inJail) {
      this.move();
    }
    const { position } = this;
    const boardPosition = this.game.state.board.positions[position];
    switch (boardPosition.type) {
      case PositionType.Blank:
      case PositionType.Chance:
      case PositionType.CommunityChest:
      case PositionType.GoToJail:
      case PositionType.Jail:
        break;
      case PositionType.Tax: {
        const { baseAmount } = boardPosition as BoardPosition<PositionType.Tax>;
        console.debug(`${this.id} deciding how to pay tax of ${baseAmount}...`);
        await this.handleFinanceOption(baseAmount, "Tax");
        break;
      }
      case PositionType.Property:
      case PositionType.Railroad:
      case PositionType.Utility: {
        const { propertyId } = boardPosition as BoardPosition<
          PositionType.Property | PositionType.Railroad | PositionType.Utility
        >;
        const property = this.game.state.propertyStore.get(propertyId);
        const owner = this.game.state.playerStore.get(property.owner);
        if (owner.isBank) {
          console.debug(
            `${this.id} deciding whether to buy ${property.name} from the bank for ${property.basePrice}...`
          );
          const shouldBuy = await this.decisionMaker.decideToBuyPropertyFromBank();
          if (!shouldBuy) {
            break;
          }
          const bank = this.game.state.playerStore.get("Bank_0");
          const quote = await bank.getPurchasePropertyQuoteForPlayer(this.id, propertyId);
          if (!quote) {
            throw new Error("bank owns property but won't sell, this is a bug");
          }
          this.purchaseProperty(quote);
          await this.handleFinanceOption(quote.offer, "Purchase Property from Bank");
        } else if (owner.id === this.id) {
          break;
        } else {
          // amount was already deducted by the event bus
          const amountPaid = this.getRentAmount(property);
          console.debug(
            `${this.id} deciding how to pay rent of ${amountPaid} for ${property.name} to ${owner.id}...`
          );
          await this.handleFinanceOption(amountPaid, "Rent Payment");
        }
        break;
      }
      default:
        assertNever(boardPosition.type);
    }

    let loanPaymentsTotal = 0;
    this.state.debtLoans.forEach(loanId => {
      this.game.state.loanStore.withLoan(loanId, loan => {
        const nominalPaymentAmount = loan.getNominalPaymentAmount();
        this.makeLoanPayment(loan.id, nominalPaymentAmount);
        loanPaymentsTotal += nominalPaymentAmount;
      });
    });
    if (loanPaymentsTotal > 0) {
      console.debug(
        `${this.id} deciding how to cover loan payments amounting to ${currencyFormatter(
          loanPaymentsTotal
        )}...`
      );
      await this.handleFinanceOption(loanPaymentsTotal, "Loan Payments");
    }
    // now all the necessary stuff is out of the way, we can now make offers to players/pay extra on debts/upgrade property/etc. this is done in the decisionMaker.doOptionalActions() method
    // console.debug(`${this.id} deciding on additional actions...`);
    await this.decisionMaker.doOptionalActions();
    // must cover shortfall if exists before ending turn
    if (this.cashOnHand < 0) {
      console.debug(
        `${this.id} deciding how to cover cash shortfall of ${currencyFormatter(
          this.cashOnHand * -1
        )}...`
      );
      await this.decisionMaker.coverCashOnHandShortfall();
      if (this.cashOnHand < 0 && this.getTotalNonCashAssetValue() > 0) {
        // somehow we've messed up and couldn't sell anything;
        console.debug(`${this.id} unable to sell anything!`);
      }
    }
    const totalAssetValue = this.getTotalNonCashAssetValue();
    if (totalAssetValue <= 0 && this.cashOnHand < 0) {
      // must declare bankruptcy
      this.declareBankruptcyInternal();
    }
  }
  private makeLoanPayment(loanId: string, paymentAmount: number) {
    const event: Omit<LoanPaymentEvent, "turn" | "order"> = {
      type: EventType.LoanPayment,
      amount: paymentAmount,
      loanId,
    };
    this.game.processEvent(event);
  }
  declareBankruptcy(): void {
    console.log(`${this.id} has declared bankruptcy!`);
    this.debtLoans.forEach(loanId => {
      const event: Omit<NullifyLoanEvent, "turn" | "order"> = {
        loanId,
        type: EventType.NullifyLoan,
      };
      this.game.processEvent(event);
    });
    this.creditLoans.forEach(loanId => {
      const event: Omit<LoanTransferEvent, "turn" | "order"> = {
        loanId,
        type: EventType.LoanTransfer,
        amount: 0,
        newCreditor: "Bank_0" as PlayerId,
        originalCreditor: this.id,
      };
      this.game.processEvent(event);
    });
    this.properties.forEach(propertyId => {
      const property = this.game.state.propertyStore.get(propertyId);
      if (property.propertyType === PositionType.Property && property.level > 0) {
        const downgradeEvent: Omit<PropertyDowngradeEvent, "turn" | "order"> = {
          propertyId,
          newLevel: 0,
          type: EventType.PropertyDowngrade,
        };
        this.game.processEvent(downgradeEvent);
      }
      const sellEvent: Omit<PropertyTransferEvent, "turn" | "order"> = {
        type: EventType.PropertyTransfer,
        propertyType: property.propertyType,
        propertyId,
        amount: 0,
        from: this.id,
        to: "Bank_0" as PlayerId,
      };
      this.game.processEvent(sellEvent);
    });
    this.state.isBankrupt = true;
  }
  private declareBankruptcyInternal() {
    if (
      this.game.state.playerTurnOrder.length === 0 &&
      this.game.state.playerTurnOrder[0] === this.id
    ) {
      console.log("not declaring bankruptcy because I just won");
      return;
    }
    const event: Omit<PlayerDeclareBankruptcyEvent, "turn" | "order"> = {
      player: this.id,
      type: EventType.PlayerDeclareBankruptcy,
    };
    this.game.processEvent(event);
  }
  private getRentAmount(property: Property | Railroad | Utility): number {
    const { propertyId, propertyType } = property;
    const event: Omit<RentPaymentEvent, "turn" | "order"> = {
      type: EventType.RentPayment,
      player: this.id,
      propertyId,
      propertyType,
    };
    return determineRentPaymentAmount(event, this.game.state);
  }
}

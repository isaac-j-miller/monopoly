import { GameState, PlayerId } from "common/state/types";
import { assertNever } from "common/util";
import { getPropertyRealValue, getPropertyRent, getUpgradeCost } from "common/property/upgrades";
import { BoardPosition, PositionType } from "common/board/types";
import { RuntimeConfig } from "common/config/types";
import { Property } from "common/property/types";
import { EventHook } from "common/game/types";
import {
  CompletePlayerTurnEvent,
  CompleteTurnEvent,
  DrawChanceCardEvent,
  DrawCommunityChestCardEvent,
  EventType,
  GameEvent,
  GetOutOfJailEvent,
  GoToJailEvent,
  LoanAccrueInterestEvent,
  LoanCreationEvent,
  LoanPaymentEvent,
  LoanChangeInterestRateEvent,
  LoanTransferEvent,
  PayBankEvent,
  PlayerDeclareBankruptcyEvent,
  PlayerMoveEvent,
  PlayerPayOffLoanEvent,
  PropertyTransferEvent,
  PropertyUpgradeEvent,
  RentPaymentEvent,
  UseChanceCardEvent,
  UseCommunityChestCardEvent,
  PayBankReason,
  GetOutOfJailReason,
  RollEvent,
  PropertyDowngradeEvent,
  BankPayPlayerEvent,
  StartGameEvent,
  StartPlayerTurnEvent,
} from "./types";
import { determineRentPaymentAmount } from "./util";

type GameStateAndEventsObject = {
  initialState: GameState;
  events: GameEvent[];
};

export class EventBus {
  private eventHooks: EventHook[];
  private events: GameEvent[];
  private currentState: GameState;
  constructor(
    private config: RuntimeConfig,
    private readonly initialState: GameState,
    events?: GameEvent[]
  ) {
    this.events = events ?? [];
    this.currentState = { ...initialState };
    this.eventHooks = [];
  }

  get state(): GameState {
    return this.currentState;
  }
  registerEventHook(hook: EventHook) {
    this.eventHooks.push(hook);
  }
  toObject(): GameStateAndEventsObject {
    const { initialState, events } = this;
    return { initialState, events };
  }
  processEvent(event: GameEvent) {
    console.debug(`Event bus got event ${EventType[event.type]}`, event);
    this.handleStateUpdate(event);
    this.events.push(event);
    this.eventHooks.forEach(hook => {
      hook(event);
    });
    // console.debug("new state", this.state)
  }
  private handleStateUpdate(event: GameEvent) {
    switch (event.type) {
      case EventType.StartPlayerTurn:
        return this.processStartPlayerTurn(event);
      case EventType.CompletePlayerTurn:
        return this.processCompletePlayerTurn(event);
      case EventType.CompleteTurn:
        return this.processCompleteTurn(event);
      case EventType.DrawChanceCard:
        return this.processDrawChanceCard(event);
      case EventType.DrawCommunityChestCard:
        return this.processDrawCommunityChestCard(event);
      case EventType.GetOutOfJail:
        return this.processGetOutOfJail(event);
      case EventType.GoToJail:
        return this.processGoToJail(event);
      case EventType.LoanCreation:
        return this.processLoanCreation(event);
      case EventType.LoanPayment:
        return this.processLoanPayment(event);
      case EventType.LoanChangeInterestRate:
        return this.processLoanRaiseInterestRate(event);
      case EventType.LoanTransfer:
        return this.processLoanTransfer(event);
      case EventType.PayBank:
        return this.processPayBank(event);
      case EventType.BankPayPlayer:
        return this.processBankPayPlayer(event);
      case EventType.PlayerDeclareBankruptcy:
        return this.processPlayerDeclareBankruptcy(event);
      case EventType.PlayerMove:
        return this.processPlayerMove(event);
      case EventType.PlayerPayOffLoan:
        return this.processPlayerPayOffLoan(event);
      case EventType.PropertyTransfer:
        return this.processPropertyTransfer(event);
      case EventType.PropertyUpgrade:
        return this.processPropertyUpgrade(event);
      case EventType.PropertyDowngrade:
        return this.processPropertyDowngrade(event);
      case EventType.RentPayment:
        return this.processRentPayment(event);
      case EventType.UseChanceCard:
        return this.processUseChanceCard(event);
      case EventType.UseCommunityChestCard:
        return this.processUseCommunityChestCard(event);
      case EventType.LoanAccrueInterest:
        return this.processLoanAccrueInterest(event);
      case EventType.Roll:
        return this.processRoll(event);
      case EventType.StartGame:
        return this.processStartGame(event);
      default:
        assertNever(event);
    }
  }
  private processStartGame(_event: StartGameEvent) {
    this.state.started = true;
  }
  private processRoll(event: RollEvent) {
    const { player: playerId, roll } = event;
    this.currentState.playerStore.withPlayer(playerId, player => {
      player.setMostRecentRoll(roll);
      if (roll[0] === roll[1] && player.inJail) {
        const getOutOfJailEvent: GetOutOfJailEvent = {
          order: this.currentState.currentPlayerTurn,
          reason: GetOutOfJailReason.Doubles,
          player: playerId,
          turn: this.currentState.turn,
          type: EventType.GetOutOfJail,
        };
        this.processEvent(getOutOfJailEvent);
      }
    });
  }

  private processStartPlayerTurn(event: StartPlayerTurnEvent) {
    const turnOrder = this.state.playerTurnOrder.findIndex(p => p === event.player);
    this.currentState.currentPlayerTurn = turnOrder;
  }
  private processCompletePlayerTurn(_event: CompletePlayerTurnEvent) {
    // TODO: something?
  }
  private processCompleteTurn(_event: CompleteTurnEvent) {
    this.currentState.currentPlayerTurn = 0;
    this.currentState.turn++;
  }
  private processGoToJail(event: GoToJailEvent) {
    const { player, turn } = event;
    this.currentState.playerStore.withPlayer(player, p => p.goToJail(turn));
  }
  private processLoanAccrueInterest(event: LoanAccrueInterestEvent) {
    const { loanId } = event;
    const loan = this.currentState.loanStore.get(loanId);
    loan.accrueInterest();
  }
  private processLoanCreation(event: LoanCreationEvent) {
    const { loan } = event;
    const { id } = loan;
    this.currentState.loanStore.set(loan);
    this.currentState.playerStore.withPlayer(loan.creditor, creditor => creditor.addCreditLoan(id));
    this.currentState.playerStore.withPlayer(loan.debtor, debtor => debtor.addDebtLoan(id));
  }
  private processLoanPayment(event: LoanPaymentEvent) {
    const { loanId, amount } = event;
    this.currentState.loanStore.withLoan(loanId, loan => {
      this.currentState.playerStore.withPlayer(loan.creditor, creditor => creditor.addCash(amount));
      this.currentState.playerStore.withPlayer(loan.debtor, debtor => debtor.subtractCash(amount));
      loan.makePayment(amount);
    });
  }
  private processLoanRaiseInterestRate(event: LoanChangeInterestRateEvent) {
    const { loanId, newInterestRate } = event;
    this.currentState.loanStore.withLoan(loanId, loan => loan.setRate(newInterestRate));
  }
  private processLoanTransfer(event: LoanTransferEvent) {
    const { loanId, newCreditor, originalCreditor, amount } = event;
    this.currentState.loanStore.withLoan(loanId, loan => {
      this.currentState.playerStore.withPlayer(originalCreditor, oc => {
        this.currentState.playerStore.withPlayer(newCreditor, nc => {
          oc.removeCreditLoan(loanId);
          nc.addCreditLoan(loanId);
          oc.addCash(amount);
          nc.subtractCash(amount);
          loan.setCreditor(nc.id);
          oc.addCash(amount);
          nc.subtractCash(amount);
        });
      });
    });
  }
  private processPayBank(event: PayBankEvent) {
    const { player, amount } = event;
    this.currentState.playerStore.withPlayer(player, p => p.subtractCash(amount));
  }
  private processBankPayPlayer(event: BankPayPlayerEvent) {
    const { player, amount } = event;
    this.currentState.playerStore.withPlayer(player, p => p.addCash(amount));
  }
  private processPlayerLandedOn(playerId: PlayerId) {
    this.currentState.playerStore.withPlayer(playerId, player => {
      const { position } = player;
      const landedOn = this.currentState.board.positions[position];
      switch (landedOn.type) {
        case PositionType.Blank:
        case PositionType.Jail:
          return;
        case PositionType.Chance: {
          const event: DrawChanceCardEvent = {
            order: this.currentState.currentPlayerTurn,
            turn: this.currentState.turn,
            player: playerId,
            type: EventType.DrawChanceCard,
          };
          return this.processEvent(event);
        }
        case PositionType.CommunityChest: {
          const event: DrawCommunityChestCardEvent = {
            order: this.currentState.currentPlayerTurn,
            turn: this.currentState.turn,
            player: playerId,
            type: EventType.DrawCommunityChestCard,
          };
          return this.processEvent(event);
        }
        case PositionType.GoToJail: {
          const event: GoToJailEvent = {
            order: this.currentState.currentPlayerTurn,
            turn: this.currentState.turn,
            player: playerId,
            type: EventType.GoToJail,
          };
          return this.processEvent(event);
        }
        case PositionType.Property:
        case PositionType.Railroad:
        case PositionType.Utility: {
          const asProperty = landedOn as BoardPosition<PositionType.Property>;
          const { propertyId } = asProperty;
          const property = this.currentState.propertyStore.get(propertyId);
          const owner = this.currentState.playerStore.get(property.owner);
          // console.log(`Owner: ${property.owner}`, owner)
          if (owner.id === playerId) {
            return;
          }
          if (owner.isBank) {
            return;
          }
          const event: RentPaymentEvent = {
            type: EventType.RentPayment,
            propertyType: landedOn.type,
            order: this.currentState.currentPlayerTurn,
            player: playerId,
            propertyId: propertyId,
            turn: this.currentState.turn,
          };
          return this.processEvent(event);
        }
        case PositionType.Tax: {
          const asTax = landedOn as BoardPosition<PositionType.Tax>;
          const event: PayBankEvent = {
            type: EventType.PayBank,
            reason: asTax.taxType,
            amount: asTax.baseAmount,
            order: this.currentState.currentPlayerTurn,
            turn: this.currentState.turn,
            player: playerId,
          };
          return this.processEvent(event);
        }
        default:
          assertNever(landedOn.type);
      }
    });
  }
  private processPlayerMove(event: PlayerMoveEvent) {
    const { player: playerId, delta } = event;
    this.currentState.playerStore.withPlayer(playerId, player => {
      let newPosition = player.position + delta;
      if (newPosition > this.currentState.board.positions.length) {
        newPosition -= this.currentState.board.positions.length;
      }
      player.setPosition(newPosition);
    });
    this.processPlayerLandedOn(playerId);
  }
  private processPlayerPayOffLoan(event: PlayerPayOffLoanEvent) {
    const { loanId } = event;
    const loan = this.currentState.loanStore.get(loanId);
    const payoffAmount = loan.getCurrentBalance();
    const paymentEvent: LoanPaymentEvent = {
      amount: payoffAmount,
      loanId,
      order: event.order,
      turn: event.turn,
      type: EventType.LoanPayment,
    };
    this.processEvent(paymentEvent);
  }
  private processPropertyTransfer(event: PropertyTransferEvent) {
    const { amount, from, to, propertyId, propertyType } = event;
    this.currentState.playerStore.withPlayer(from, previousOwner => {
      this.currentState.playerStore.withPlayer(to, newOwner => {
        previousOwner.removeProperty(propertyId);
        newOwner.addProperty(propertyId);
        previousOwner.addCash(amount);
        newOwner.subtractCash(amount);
        switch (propertyType) {
          case PositionType.Railroad:
            this.currentState.propertyStore.updateRailroad(propertyId, { owner: to });
            break;
          case PositionType.Utility:
            this.currentState.propertyStore.updateUtility(propertyId, { owner: to });
            break;
          case PositionType.Property:
            this.currentState.propertyStore.updateProperty(propertyId, { owner: to });
            break;
          default:
            assertNever(propertyType);
        }
      });
    });
  }

  private processPropertyUpgrade(event: PropertyUpgradeEvent) {
    const { propertyId, newLevel } = event;
    this.currentState.propertyStore.withProperty(propertyId, property => {
      property = property as Property;
      const amount = getUpgradeCost(property, newLevel);
      const payBankEvent: PayBankEvent = {
        type: EventType.PayBank,
        reason: PayBankReason.PropertyUpgrade,
        amount,
        order: event.order,
        turn: event.turn,
        player: property.owner,
      };
      this.processEvent(payBankEvent);
      property.level = newLevel;
      property.realValue = getPropertyRealValue(property.basePrice, property.level);
      property.currentRent = getPropertyRent(property.baseRent, property.level);
    });
  }
  private processPropertyDowngrade(event: PropertyDowngradeEvent) {
    const { propertyId, newLevel } = event;
    this.currentState.propertyStore.withProperty(propertyId, property => {
      property = property as Property;
      const valueChange = getUpgradeCost(property, newLevel);
      const amount = valueChange * -2;
      const bankPayPlayerEvent: BankPayPlayerEvent = {
        type: EventType.BankPayPlayer,
        amount,
        order: event.order,
        turn: event.turn,
        player: property.owner,
      };
      this.processEvent(bankPayPlayerEvent);
      property.level = newLevel;
      property.realValue = getPropertyRealValue(property.basePrice, property.level);
      property.currentRent = getPropertyRent(property.baseRent, property.level);
    });
  }
  private processRentPayment(event: RentPaymentEvent) {
    const paymentAmount = determineRentPaymentAmount(event, this.currentState);
    const { propertyId, player } = event;
    const property = this.currentState.propertyStore.get(propertyId);
    this.currentState.playerStore.withPlayer(player, renter => {
      this.currentState.playerStore.withPlayer(property.owner, owner => {
        renter.subtractCash(paymentAmount);
        owner.addCash(paymentAmount);
      });
    });
  }
  private processGetOutOfJail(event: GetOutOfJailEvent) {
    const { player, reason } = event;
    if (reason === GetOutOfJailReason.Pay) {
      const payBankEvent: PayBankEvent = {
        amount: this.config.jail.getOfJailBaseCost,
        order: event.order,
        reason: PayBankReason.PayToGetOutOfJail,
        player,
        turn: event.turn,
        type: EventType.PayBank,
      };
      this.processEvent(payBankEvent);
    }
    this.currentState.playerStore.withPlayer(player, p => p.getOutOfJail());
  }
  private processPlayerDeclareBankruptcy(event: PlayerDeclareBankruptcyEvent) {
    // throw new Error("Method not implemented.");
  }
  private processDrawChanceCard(event: DrawChanceCardEvent) {
    // throw new Error("Method not implemented.");
  }
  private processUseChanceCard(event: UseChanceCardEvent) {
    // throw new Error("Method not implemented.");
  }
  private processDrawCommunityChestCard(event: DrawCommunityChestCardEvent) {
    // throw new Error("Method not implemented.");
  }
  private processUseCommunityChestCard(event: UseCommunityChestCardEvent) {
    // throw new Error("Method not implemented.");
  }
}

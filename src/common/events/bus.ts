import { GameState, PlayerId } from "common/state/types";
import { assertNever } from "common/util";
import {
  getPropertyMarketValue,
  getPropertyRealValue,
  getPropertyRent,
  getUpgradeCost,
  updatePropertyValue,
  updateRailroadValue,
  updateUtilityValue,
} from "common/property/upgrades";
import { BoardPosition, PositionType } from "common/board/types";
import { RuntimeConfig } from "common/config/types";
import { Property } from "common/property/types";
import { Loan } from "common/loan";
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
  NullifyLoanEvent,
  PlayerVictoryEvent,
  PlayerPassGoEvent,
} from "./types";
import { determineRentPaymentAmount } from "./util";

type GameStateAndEventsObject = {
  initialState: GameState;
  events: GameEvent[];
};

const eventsToKeep = new Set<EventType>([
  EventType.LoanCreation,
  EventType.LoanTransfer,
  EventType.PropertyTransfer,
  EventType.RentPayment,
  EventType.PlayerVictory,
  EventType.PlayerDeclareBankruptcy,
]);

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
    if (eventsToKeep.has(event.type)) {
      console.debug(`Event bus got event ${EventType[event.type]}`, event);
    }
    this.handleStateUpdate(event);
    this.events.push(event);
    this.eventHooks.forEach(hook => {
      hook(event);
    });
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
      case EventType.NullifyLoan:
        return this.processNullifyLoan(event);
      case EventType.PlayerVictory:
        return this.processPlayerVictory(event);
      case EventType.PlayerPassGo:
        return this.processPlayerPassGo(event);
      default:
        assertNever(event);
    }
  }
  private processPlayerPassGo(event: PlayerPassGoEvent) {
    this.state.playerStore.withPlayer(event.player, player =>
      player.addCash(this.config.runtime.passGoAmount)
    );
  }
  private processPlayerVictory(event: PlayerVictoryEvent) {
    this.state.isDone = true;
    console.log(`${event.player} has won on turn ${this.state.turn}!`);
  }
  private processNullifyLoan(event: NullifyLoanEvent) {
    const { loanId } = event;
    this.currentState.loanStore.withLoan(loanId, loan => {
      loan.nullify();
      const { creditor, debtor } = loan;
      this.currentState.playerStore.withPlayer(creditor, player => player.removeCreditLoan(loanId));
      this.currentState.playerStore.withPlayer(debtor, player => player.removeDebtLoan(loanId));
    });
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
  private processCompletePlayerTurn(event: CompletePlayerTurnEvent) {
    // console.log(`${event.player} completed turn ${event.turn}`);
  }
  private processCompleteTurn(event: CompleteTurnEvent) {
    this.currentState.currentPlayerTurn = 0;
    this.currentState.turn++;
    this.state.loanStore.all().forEach(loan => {
      if (loan.getCurrentBalance() > 0) {
        return;
      }
      const event: LoanAccrueInterestEvent = {
        type: EventType.LoanAccrueInterest,
        loanId: loan.id,
        order: this.currentState.currentPlayerTurn,
        turn: this.currentState.turn,
      };
      this.processEvent(event);
    });
    this.state.propertyStore.all().forEach(({ propertyId }) => {
      this.state.propertyStore.withProperty(propertyId, property => {
        switch (property.propertyType) {
          case PositionType.Property:
            updatePropertyValue(property, this.state, this.config);
            break;
          case PositionType.Utility:
            updateUtilityValue(property, this.state, this.config);
            break;
          case PositionType.Railroad:
            updateRailroadValue(property, this.state, this.config);
            break;
          default:
            assertNever(property);
        }
        if (property.mostRecentSale?.turn === event.turn) {
          property.marketValue = property.mostRecentSale.amount;
        }
      });
    });
  }
  private processGoToJail(event: GoToJailEvent) {
    const { player, turn } = event;
    this.currentState.playerStore.withPlayer(player, p => p.goToJail(turn));
  }
  private processLoanAccrueInterest(event: LoanAccrueInterestEvent) {
    const { loanId } = event;
    this.currentState.loanStore.withLoan(loanId, loan => loan.accrueInterest());
  }
  private processLoanCreation(event: LoanCreationEvent) {
    const { loan } = event;
    const { id } = loan;
    const newLoan = new Loan(loan);
    this.currentState.loanStore.set(newLoan);
    this.currentState.playerStore.withPlayer(loan.creditor, creditor => {
      creditor.addCreditLoan(id);
      creditor.subtractCash(loan.initialPrincipal);
    });
    this.currentState.playerStore.withPlayer(loan.debtor, debtor => {
      debtor.addDebtLoan(id);
      debtor.addCash(loan.initialPrincipal);
    });
    // console.log(`Created loan with ID ${id}. creditor: ${loan.creditor}, debtor: ${loan.debtor}`);
  }
  private processLoanPayment(event: LoanPaymentEvent) {
    const { loanId, amount } = event;
    this.currentState.loanStore.withLoan(loanId, loan => {
      this.currentState.playerStore.withPlayer(loan.creditor, creditor => creditor.addCash(amount));
      this.currentState.playerStore.withPlayer(loan.debtor, debtor => {
        debtor.subtractCash(amount);
        const balance = loan.makePayment(amount);
        if (balance < 0) {
          const abs = Math.abs(balance);
          debtor.addCash(abs);
          const payoffEvent: PlayerPayOffLoanEvent = {
            type: EventType.PlayerPayOffLoan,
            loanId,
            order: this.state.currentPlayerTurn,
            player: debtor.id,
            turn: this.state.turn,
          };
          this.processEvent(payoffEvent);
        }
      });
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
      if (newPosition >= this.currentState.board.positions.length) {
        newPosition -= this.currentState.board.positions.length;
        const passGoEvent: PlayerPassGoEvent = {
          player: event.player,
          turn: this.state.turn,
          order: this.state.currentPlayerTurn,
          type: EventType.PlayerPassGo,
        };
        this.processEvent(passGoEvent);
      }
      player.setPosition(newPosition);
    });
    this.processPlayerLandedOn(playerId);
  }
  private processPlayerPayOffLoan(event: PlayerPayOffLoanEvent) {
    const { loanId } = event;
    const loan = this.currentState.loanStore.get(loanId);
    const { creditor, debtor } = loan;
    this.currentState.playerStore.withPlayer(creditor, player => player.removeCreditLoan(loanId));
    this.currentState.playerStore.withPlayer(debtor, player => player.removeDebtLoan(loanId));
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
          case PositionType.Railroad: {
            this.currentState.propertyStore.updateRailroad(propertyId, { owner: to });
            break;
          }
          case PositionType.Utility: {
            this.currentState.propertyStore.updateUtility(propertyId, { owner: to });
            break;
          }
          case PositionType.Property: {
            this.currentState.propertyStore.updateProperty(propertyId, { owner: to });
            break;
          }
          default:
            assertNever(propertyType);
        }
        this.currentState.propertyStore.withProperty(propertyId, property => {
          property.mostRecentSale = {
            turn: event.turn,
            amount,
          };
        });
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
      property.realValue = getPropertyRealValue(property);
      property.marketValue = getPropertyMarketValue(
        property,
        this.state,
        this.config.runtime.turnsToCountForNPV
      );
      property.currentRent = getPropertyRent(property.baseRent, property.level, property.color);
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
      property.realValue = getPropertyRealValue(property);
      property.marketValue = getPropertyMarketValue(
        property,
        this.state,
        this.config.runtime.turnsToCountForNPV
      );
      property.currentRent = getPropertyRent(property.baseRent, property.level, property.color);
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
    const idx = this.state.playerTurnOrder.findIndex(p => p === event.player);
    const playerCount = this.state.playerTurnOrder.length;
    this.state.playerTurnOrder = [
      ...this.state.playerTurnOrder.slice(0, idx),
      ...this.state.playerTurnOrder.slice(idx + 1),
    ];
    const newPlayerCount = this.state.playerTurnOrder.length;
    this.state.playerStore.withPlayer(event.player, player => {
      player.declareBankruptcy();
    });
    console.log(
      `Player ${event.player} eliminated, bringing number of players from ${playerCount} to ${newPlayerCount}`
    );

    if (newPlayerCount === 1) {
      const victoryEvent: PlayerVictoryEvent = {
        player: this.state.playerTurnOrder[0],
        type: EventType.PlayerVictory,
        turn: this.state.turn,
        order: this.state.currentPlayerTurn,
      };
      this.processEvent(victoryEvent);
    }
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

import { GameState, PlayerId } from "common/state/types";
import { CompletePlayerTurnEvent, CompleteTurnEvent, DrawChanceCardEvent, DrawCommunityChestCardEvent, EventType, GameEvent, GetOutOfJailEvent, GoToJailEvent, LoanAccrueInterestEvent, LoanCreationEvent, LoanPaymentEvent, LoanChangeInterestRateEvent, LoanTransferEvent, PayBankEvent, PlayerDeclareBankruptcyEvent, PlayerMoveEvent, PlayerPayOffLoanEvent, PropertyTransferEvent, PropertyUpgradeEvent, RentPaymentEvent, UseChanceCardEvent, UseCommunityChestCardEvent, PayBankReason, GetOutOfJailReason, RollEvent } from "./types";
import { assertIsDefined, assertNever } from "common/util";
import { defaultRailroadQuantityRents, defaultUtilityQuantityRollMultipliers, getPropertyRealValue, getPropertyRent, getUpgradeCost } from "common/property/upgrades";
import { BoardPosition, PositionType } from "common/board/types";
import { Property } from "common/property/types";

type GameStateAndEventsObject = {
    initialState: GameState;
    events: GameEvent[];
}

export class EventBus {
    private events: GameEvent[];
    private currentState: GameState;
    constructor(private readonly initialState: GameState, events?: GameEvent[]) {
        this.events = events ?? [];
        this.currentState = {...initialState};
    }
    
    get state(): GameState {
        return this.currentState;
    }

    toObject(): GameStateAndEventsObject {
        const {initialState, events} = this;
        return {initialState, events}
    }
    processEvent(event: GameEvent) {
        this.handleStateUpdate(event);
        this.events.push(event);
    }
    private handleStateUpdate(event: GameEvent) {
        switch(event.type) {
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
            case EventType.RentPayment:
                return this.processRentPayment(event);
            case EventType.UseChanceCard:
                return this.processUseChanceCard(event);
            case EventType.UseCommunityChestCard:
                return this.processUseCommunityChestCard(event);
            case EventType.LoanAccrueInterest:
                return this.processLoanAccrueInterest(event);
            case EventType.Roll:
                return this.processRoll(event)
            default:
                assertNever(event)
        }
    }
    private processRoll(event: RollEvent) {
        const {player: playerId, roll} = event;
        const player = this.currentState.playerStore.get(playerId)
        player.setMostRecentRoll(roll)
        if(roll[0]===roll[1] && player.inJail) {
            const getOutOfJailEvent: GetOutOfJailEvent = {
                order: this.currentState.currentPlayerTurn,
                reason: GetOutOfJailReason.Doubles,
                player: playerId,
                turn: this.currentState.turn,
                type: EventType.GetOutOfJail
            }
            this.processEvent(getOutOfJailEvent)
        }
    }

    private processCompletePlayerTurn(_event: CompletePlayerTurnEvent) {
        this.currentState.currentPlayerTurn++;
    }
    private processCompleteTurn(_event: CompleteTurnEvent) {
        this.currentState.currentPlayerTurn = 0;
        this.currentState.turn++;
    }
    private processGoToJail(event: GoToJailEvent) {
        const {player, turn} = event;
        this.currentState.playerStore.get(player).goToJail(turn)
    }
    private processLoanAccrueInterest(event: LoanAccrueInterestEvent) {
        const {loanId} = event;
        const loan = this.currentState.loanStore.get(loanId);
        loan.accrueInterest();
    }
    private processLoanCreation(event: LoanCreationEvent) {
        const {loan} = event;
        const {id} = loan;
        this.currentState.loanStore.add(loan)
        this.currentState.playerStore.get(loan.creditor).addCreditLoan(id);
        this.currentState.playerStore.get(loan.debtor).addDebtLoan(id)
    }
    private processLoanPayment(event: LoanPaymentEvent) {
        const {loanId, amount} = event;
        const loan = this.currentState.loanStore.get(loanId);
        const creditor = this.currentState.playerStore.get(loan.creditor);
        const debtor = this.currentState.playerStore.get(loan.debtor);
        debtor.subtractCash(amount);
        creditor.addCash(amount);
        loan.makePayment(amount);
    }
    private processLoanRaiseInterestRate(event: LoanChangeInterestRateEvent) {
        const {loanId, newInterestRate} = event;
        this.currentState.loanStore.get(loanId).setRate(newInterestRate);
    }
    private processLoanTransfer(event: LoanTransferEvent) {
        const {loanId, newCreditor, originalCreditor, amount} = event;
        const oc = this.currentState.playerStore.get(originalCreditor);
        const nc = this.currentState.playerStore.get(newCreditor);
        oc.removeCreditLoan(loanId)
        nc.addCreditLoan(loanId)
        oc.addCash(amount)
        nc.subtractCash(amount)
        this.currentState.loanStore.get(loanId).setCreditor(nc.id);
        oc.addCash(amount);
        nc.subtractCash(amount)
    }
    private processPayBank(event: PayBankEvent) {
        const {player, amount} = event;
        this.currentState.playerStore.get(player).subtractCash(amount);
    }
    private processPlayerLandedOn(playerId: PlayerId) {
        const player = this.currentState.playerStore.get(playerId);
        const {position} = player;
        const landedOn = this.currentState.board.positions[position];
        switch(landedOn.type) {
            case PositionType.Blank:
            case PositionType.Jail:
                return;
            case PositionType.Chance: {
                const event: DrawChanceCardEvent = {
                    order: this.currentState.currentPlayerTurn,
                    turn: this.currentState.turn,
                    player: playerId,
                    type: EventType.DrawChanceCard
                }
                return this.processEvent(event)
            }
            case PositionType.CommunityChest:{
                const event: DrawCommunityChestCardEvent = {
                    order: this.currentState.currentPlayerTurn,
                    turn: this.currentState.turn,
                    player: playerId,
                    type: EventType.DrawCommunityChestCard
                }
                return this.processEvent(event)
            }
            case PositionType.GoToJail: {
                const event: GoToJailEvent  = {
                    order: this.currentState.currentPlayerTurn,
                    turn: this.currentState.turn,
                    player: playerId,
                    type: EventType.GoToJail
                }
                return this.processEvent(event);
            }
            case PositionType.Property: 
            case PositionType.Railroad:
            case PositionType.Utility: {
                const asProperty = landedOn as BoardPosition<PositionType.Property>;
                const {propertyId} = asProperty;
                const property = this.currentState.propertyStore.get(propertyId);
                const owner = this.currentState.playerStore.get(property.owner);
                if(owner.id === playerId) {
                    return 
                }
                if(owner.isBank) {
                    // TODO: implement purchase or auction or whatever
                    return;
                } 
                const event: RentPaymentEvent = {
                    type: EventType.RentPayment,
                    propertyType: landedOn.type,
                    order: this.currentState.currentPlayerTurn,
                    player: playerId,
                    propertyId: propertyId,
                    turn: this.currentState.turn
                }
                return this.processEvent(event)
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
                }
                return this.processEvent(event)
            }
            default:
                assertNever(landedOn.type);
        }
    }
    private processPlayerMove(event: PlayerMoveEvent) {
        const {player: playerId, delta} = event;
        const player = this.currentState.playerStore.get(playerId)
        let newPosition = player.position + delta;
        if(newPosition > this.currentState.board.positions.length) {
            newPosition -= this.currentState.board.positions.length;
        }
        player.setPosition(newPosition)
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
            type: EventType.LoanPayment
        }
        this.processEvent(paymentEvent);
    }
    private processPropertyTransfer(event: PropertyTransferEvent) {
        const {amount,from,to,propertyId, propertyType} = event;
        const previousOwner = this.currentState.playerStore.get(from);
        const newOwner = this.currentState.playerStore.get(to);
        previousOwner.removeProperty(propertyId);
        newOwner.addProperty(propertyId);
        previousOwner.addCash(amount);
        newOwner.subtractCash(amount)
        switch(propertyType) {
            case PositionType.Railroad:
                this.currentState.propertyStore.updateRailroad(propertyId, {owner: to})
                break;
            case PositionType.Utility:
                this.currentState.propertyStore.updateUtility(propertyId, {owner: to})
                break;
            case PositionType.Property:
                this.currentState.propertyStore.updateProperty(propertyId, {owner: to})
                break;
            default:
                assertNever(propertyType)
        }
    }
    
    private processPropertyUpgrade(event: PropertyUpgradeEvent) {
        const {propertyId, newLevel} = event;
        const property = this.currentState.propertyStore.get(propertyId) as Property;
        const amount =getUpgradeCost(property, newLevel);
        const payBankEvent: PayBankEvent = {
            type: EventType.PayBank,
            reason: PayBankReason.PropertyUpgrade,
            amount,
            order: event.order,
            turn: event.turn,
            player: property.owner
        }
        this.processEvent(payBankEvent);
        property.level = newLevel;
        property.realValue = getPropertyRealValue(property.basePrice, property.level);
        property.currentRent = getPropertyRent(property.baseRent, property.level);
    }
    private processRentPayment(event: RentPaymentEvent) {
        const {propertyId, player } = event;
        const property = this.currentState.propertyStore.get(propertyId);
        const renter = this.currentState.playerStore.get(player);
        const owner = this.currentState.playerStore.get(property.owner);
        let paymentAmount: number | undefined;
        switch(property.propertyType) {
            case PositionType.Property: {
                const othersOfColor = this.currentState.board.getAllPropertiesOfColor(property.color);
                const ownerHasAllOfColor = othersOfColor.every(v=> {
                    const p = this.currentState.propertyStore.get(v.propertyId);
                    return p.owner === owner.id
                });
                const rent = property.currentRent;
                paymentAmount = ownerHasAllOfColor ? (rent * 2) : rent;
                break;
            }
            case PositionType.Utility:
            case PositionType.Railroad: {
                const allPropertiesOfType = this.currentState.board.getAllPositionsOfType(property.propertyType);
                const allOfTypeOwnedBySameOwner = allPropertiesOfType.filter(v=> {
                    const p = this.currentState.propertyStore.get(v.propertyId);
                    return p.owner === owner.id
                });
                const numberOfTypeOwnedByOwner = allOfTypeOwnedBySameOwner.length;
                switch(property.propertyType) {
                    case PositionType.Utility: {
                        const {mostRecentRoll} = renter;
                        assertIsDefined(mostRecentRoll);
                        const rollTotal = mostRecentRoll[0] + mostRecentRoll[1];
                        paymentAmount = defaultUtilityQuantityRollMultipliers[numberOfTypeOwnedByOwner] * rollTotal
                        break
                    }
                    case PositionType.Railroad: 
                        paymentAmount = defaultRailroadQuantityRents[numberOfTypeOwnedByOwner];
                        break
                    default:
                        assertNever(property)
                }
                break;
            }
            default:
                assertNever(property);
        }
        assertIsDefined(paymentAmount);
        renter.subtractCash(paymentAmount);
        owner.addCash(paymentAmount);
    }
    private processGetOutOfJail(event: GetOutOfJailEvent) {
        const {player, reason} = event;
        if(reason === GetOutOfJailReason.Pay) {
            const payBankEvent: PayBankEvent = {
                amount: 50,
                order: event.order,
                reason: PayBankReason.PayToGetOutOfJail,
                player,
                turn: event.turn,
                type: EventType.PayBank
            }
            this.processEvent(payBankEvent)
        }
        this.currentState.playerStore.get(player).getOutOfJail();
    }
    private processPlayerDeclareBankruptcy(event: PlayerDeclareBankruptcyEvent) {
        throw new Error("Method not implemented.");
    }
    private processUseChanceCard(event: UseChanceCardEvent) {
        throw new Error("Method not implemented.");
    }
    private processUseCommunityChestCard(event: UseCommunityChestCardEvent) {
        throw new Error("Method not implemented.");
    }
    private processDrawCommunityChestCard(event: DrawCommunityChestCardEvent) {
        throw new Error("Method not implemented.");
    }
    private processDrawChanceCard(event: DrawChanceCardEvent) {
        throw new Error("Method not implemented.");
    }
    
}
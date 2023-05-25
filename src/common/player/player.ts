import { IGame } from "common/game/types";
import { BoardPosition, PositionType } from "common/board/types";
import { assertNever } from "common/util";
import { EventType, GetOutOfJailEvent, GetOutOfJailReason, PropertyUpgradeEvent, RentPaymentEvent } from "common/events/types";
import { Property, PropertyLevel, Railroad, Utility } from "common/property/types";
import { determineRentPaymentAmount } from "common/events/util";
import { IPlayer } from "./types";
import { PlayerBase } from "./base";

export class Player  extends PlayerBase implements IPlayer {
    upgradeProperty(propertyId: number, newLevel: PropertyLevel): void {
        const event: Omit<PropertyUpgradeEvent, "turn"|"order"> = {
            newLevel,
            propertyId,
            type: EventType.PropertyUpgrade
        }
        this.game.processEvent(event)
    }
    sellPropertyUpgrades(propertyId: number, newLevel: PropertyLevel): void {
        const event: Omit<PropertyUpgradeEvent, "turn"|"order"> = {
            newLevel,
            propertyId,
            type: EventType.PropertyUpgrade
        }
        this.game.processEvent(event)
    }
    public get isBank(): boolean {
        return false
    }
    register(game: IGame) {
        this.game = game;
        this.decisionMaker.register(game, this)
    }
    async takeTurn(): Promise<void> {
        let loanPaymentsTotal = 0;
        this.state.debtLoans.forEach(loanId => {
            const loan = this.game.state.loanStore.get(loanId);
            const nominalPaymentAmount = loan.getNominalPaymentAmount();
            loan.makePayment(nominalPaymentAmount)
            loanPaymentsTotal += nominalPaymentAmount
        })
        await this.handleFinanceOption(loanPaymentsTotal, "Loan Payments");
        const {position} = this;
        const boardPosition = this.game.state.board.positions[position];
        switch(boardPosition.type) {
            case PositionType.Blank:
            case PositionType.Chance:
            case PositionType.CommunityChest:
            case PositionType.GoToJail:
                break;
            case PositionType.Jail:
                if(!this.inJail) {
                    break;
                }
                if(this.state.getOutOfJailFreeCards > 0) {
                    const shouldUseCard = await this.decisionMaker.decideToUseGetOutOfJailFreeCard();
                    if(shouldUseCard) {
                        const useCard: Omit<GetOutOfJailEvent, "turn"|"order"> = {
                            player: this.id,
                            reason: GetOutOfJailReason.Card,
                            type: EventType.GetOutOfJail
                        }
                        this.game.processEvent(useCard)
                    }
                } else {
                    const shouldPay = await this.decisionMaker.decideToPayToGetOutOfJail();
                    if(shouldPay) {
                        const useCard: Omit<GetOutOfJailEvent, "turn"|"order"> = {
                            player: this.id,
                            reason: GetOutOfJailReason.Pay,
                            type: EventType.GetOutOfJail
                        }
                        this.game.processEvent(useCard);
                        await this.handleFinanceOption(this.config.jail.getOfJailBaseCost, "Pay to get out of jail")
                    }
                }
                break;
            case PositionType.Tax: {
                const { baseAmount} = boardPosition as BoardPosition<PositionType.Tax>
                await this.handleFinanceOption(baseAmount, "Tax")
                break;
            }
            case PositionType.Property:
            case PositionType.Railroad:
            case PositionType.Utility: {
                const {propertyId} = boardPosition as BoardPosition<PositionType.Property|PositionType.Railroad|PositionType.Utility>;
                const property = this.game.state.propertyStore.get(propertyId);
                const owner = this.game.state.playerStore.get(property.owner);
                if(owner.isBank) {
                    const shouldBuy = await this.decisionMaker.decideToBuyPropertyFromBank();
                    if(!shouldBuy) {
                        break;
                    }
                    const bank = this.game.state.playerStore.get("Bank_0");
                    const quote = await bank.getPurchasePropertyQuoteForPlayer(this.id, propertyId);
                    if(!quote) {
                        throw new Error("bank owns property but won't sell, this is a bug");
                    }
                    this.purchaseProperty(quote);
                    await this.handleFinanceOption(quote.offer, "Purchase Property from Bank")
                } else if (owner.id === this.id) {
                    break;
                } else {
                    const amountPaid = this.getRentAmount(property);
                    await this.handleFinanceOption(amountPaid, "Rent Payment")
                }
                break;
            }
            default:
                assertNever(boardPosition.type)
        }
        // if we have a negative cash balance, cover it before continuing with optional actions
        if(this.cashOnHand < 0) {
            await this.decisionMaker.coverCashOnHandShortfall();
        }
        // now all the necessary stuff is out of the way, we can now make offers to players/pay extra on debts/upgrade property/etc. this is done in the decisionMaker.doOptionalActions() method
        await this.decisionMaker.doOptionalActions();
        // must cover shortfall if exists before ending turn
        if(this.cashOnHand < 0) {
            await this.decisionMaker.coverCashOnHandShortfall();
        }
    }
    private getRentAmount(property: Property|Railroad|Utility): number {
        const {propertyId, propertyType} = property
        const event: Omit<RentPaymentEvent, "turn"|"order"> = {
            type: EventType.RentPayment,
            player: this.id,
            propertyId,
            propertyType,
        }
        return determineRentPaymentAmount(event, this.game.state)
    }
    
}
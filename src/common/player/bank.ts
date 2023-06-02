import { IGame } from "common/game/types";
import { IPlayer } from "./types";
import { PlayerBase } from "./base";
import { PropertyLevel } from "common/property/types";

export class Bank extends PlayerBase implements IPlayer {
  upgradeProperty(propertyId: number, newLevel: PropertyLevel): void {
    throw new Error("bank cannot upgrade property");
  }
  sellPropertyUpgrades(propertyId: number, newLevel: PropertyLevel): void {
    throw new Error("bank cannot sell property");
  }
  payRentToOtherPlayer(): void {
    throw new Error("bank cannot pay rent");
  }
  public get isBank(): boolean {
    return true;
  }
  declareBankruptcy(): void {
    throw new Error("bank cannot go bankrupt");
  }
  register(game: IGame) {
    if (this.isRegistered) {
      return;
    }
    this.game = game;
    this.decisionMaker.register(game, this);
  }
  async takeTurn(): Promise<void> {
    return;
  }
}

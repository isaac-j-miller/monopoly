import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { PlayerId } from "common/state/types";
import { RuntimeConfig } from "common/config/types";
import { IDecisionMaker } from "common/decision-maker/types";
import { DecisionMakerBase } from "common/decision-maker/base";
import { DecisionMakerTask, DecisionMakerTaskEvent } from "common/shared/types";
import { getUniqueId } from "common/util";
import { GameSocket } from "./game";

export class SocketIOHumanDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
  constructor(config: RuntimeConfig, private readonly socket: GameSocket) {
    super(config);
  }
  async doOptionalActions(): Promise<void> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.OptionalActions> = {
      event: null,
      taskType: DecisionMakerTask.OptionalActions,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<void>(resolve => {
      this.socket.socket.once(`CLOSE_DECISION_MAKER_TASK_${event.id}`, () => {
        resolve();
      });
    });
  }
  async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.DecideToAcceptTransferLoanQuote> = {
      event: quote,
      taskType: DecisionMakerTask.DecideToAcceptTransferLoanQuote,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<boolean>(resolve => {
      this.socket.socket.once(`CLOSE_DECISION_MAKER_TASK_${event.id}`, (answer: boolean) => {
        resolve(answer);
      });
    });
  }
  async coverCashOnHandShortfall(): Promise<void> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.CoverCashShortfall> = {
      event: null,
      taskType: DecisionMakerTask.CoverCashShortfall,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<void>(resolve => {
      this.socket.socket.once(`CLOSE_DECISION_MAKER_TASK_${event.id}`, () => {
        if (this.player.cashOnHand > 0) {
          resolve();
        } else {
          // TODO: review this behavior
          this.coverCashOnHandShortfall().then(resolve);
        }
      });
    });
  }
  async decideHowToFinancePayment(amount: number): Promise<LoanQuote | null> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.DecideHowToFinancePayment> = {
      event: amount,
      taskType: DecisionMakerTask.DecideHowToFinancePayment,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<LoanQuote | null>(resolve => {
      this.socket.socket.once(
        `CLOSE_DECISION_MAKER_TASK_${event.id}`,
        (answer: LoanQuote | null) => {
          resolve(answer);
        }
      );
    });
  }
  async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.DecideToUseGetOutOfJailFreeCard> = {
      event: null,
      taskType: DecisionMakerTask.DecideToUseGetOutOfJailFreeCard,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<boolean>(resolve => {
      this.socket.socket.once(`CLOSE_DECISION_MAKER_TASK_${event.id}`, (answer: boolean) => {
        resolve(answer);
      });
    });
  }
  async decideToPayToGetOutOfJail(): Promise<boolean> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.DecideToPayToGetOutOfJail> = {
      event: null,
      taskType: DecisionMakerTask.DecideToPayToGetOutOfJail,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<boolean>(resolve => {
      this.socket.socket.once(`CLOSE_DECISION_MAKER_TASK_${event.id}`, (answer: boolean) => {
        resolve(answer);
      });
    });
  }
  async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.DecideToAcceptPropertyQuote> = {
      event: quote,
      taskType: DecisionMakerTask.DecideToAcceptPropertyQuote,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<boolean>(resolve => {
      this.socket.socket.once(`CLOSE_DECISION_MAKER_TASK_${event.id}`, (answer: boolean) => {
        resolve(answer);
      });
    });
  }
  async getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote | null> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.WriteLoanQuoteForPlayer> = {
      event: { playerId, amount },
      taskType: DecisionMakerTask.WriteLoanQuoteForPlayer,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<LoanQuote | null>(resolve => {
      this.socket.socket.once(
        `CLOSE_DECISION_MAKER_TASK_${event.id}`,
        (answer: LoanQuote | null) => {
          resolve(answer);
        }
      );
    });
  }
  async getPurchasePropertyQuoteForPlayer(
    playerId: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.WritePropertyQuoteForPlayer> = {
      event: { playerId, propertyId },
      taskType: DecisionMakerTask.WritePropertyQuoteForPlayer,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<PropertyQuote | null>(resolve => {
      this.socket.socket.once(
        `CLOSE_DECISION_MAKER_TASK_${event.id}`,
        (answer: PropertyQuote | null) => {
          resolve(answer);
        }
      );
    });
  }
  async decideToBuyPropertyFromBank(): Promise<boolean> {
    const event: DecisionMakerTaskEvent<DecisionMakerTask.DecideToBuyCurrentPropertyFromBank> = {
      event: null,
      taskType: DecisionMakerTask.DecideToBuyCurrentPropertyFromBank,
      id: getUniqueId(),
    };
    this.socket.socket.emit("SET_DECISION_MAKER_TASK", event);
    return new Promise<boolean>(resolve => {
      this.socket.socket.once(`CLOSE_DECISION_MAKER_TASK_${event.id}`, (answer: boolean) => {
        resolve(answer);
      });
    });
  }
  setup() {}
}

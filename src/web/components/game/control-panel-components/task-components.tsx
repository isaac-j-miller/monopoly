import React from "react";
import { HumanRemoteInterface } from "src/web/game/human-interface";
import { DecisionMakerTask, DecisionMakerTaskEvent } from "common/shared/types";
import { assertNever } from "common/util";
import { BoardPosition, PositionType } from "common/board/types";
import { PropertyQuote } from "common/property/types";
import { TransferLoanQuote } from "common/loan/types";
import { PropertyQuoteDisplay } from "./property-quote";
import { SimpleYesNo } from "./simple-yes-no";
import { TransferLoanQuoteDisplay } from "./transfer-loan-quote";
import { WriteLoanQuoteForm } from "./write-loan-quote";
import { WritePropertyQuoteForm } from "./write-property-quote";

export const getTaskComponent = (
  task: DecisionMakerTaskEvent<DecisionMakerTask>,
  socket: HumanRemoteInterface
): React.ReactNode => {
  switch (task.taskType) {
    case DecisionMakerTask.None:
      return <></>;
    case DecisionMakerTask.CoverCashShortfall:
      return <></>;
    case DecisionMakerTask.DecideHowToFinancePayment:
    // TODO: actually do stuff
    case DecisionMakerTask.OptionalActions:
      // TODO: actually do stuff
      return (
        <SimpleYesNo
          yesOverride={"Yes"}
          submit={value => {
            if (value) {
              socket.completeCurrentTask(null);
            }
          }}
          prompt={"Would you like to end your turn?"}
        />
      );
    case DecisionMakerTask.WriteLoanQuoteForPlayer: {
      const params = (task as DecisionMakerTaskEvent<DecisionMakerTask.WriteLoanQuoteForPlayer>)
        .event;
      return (
        <WriteLoanQuoteForm
          playerId={socket.playerId}
          requestedAmount={params.amount}
          requestor={params.playerId}
          onSubmit={quote => {
            socket.completeCurrentTask(quote);
          }}
        />
      );
    }
    case DecisionMakerTask.WritePropertyQuoteForPlayer: {
      const params = (task as DecisionMakerTaskEvent<DecisionMakerTask.WritePropertyQuoteForPlayer>)
        .event;

      return (
        <WritePropertyQuoteForm
          onSubmit={quote => socket.completeCurrentTask(quote)}
          playerId={socket.playerId}
          requestor={params.playerId}
          propertyId={params.propertyId}
          state={socket.gameState()}
        />
      );
    }
    case DecisionMakerTask.DecideToAcceptPropertyQuote: {
      const state = socket.gameState();
      const quote = task.event as PropertyQuote;
      const action = quote.owner === socket.playerId ? "Sell" : "Buy";
      return (
        <SimpleYesNo
          yesOverride={`${action} ${quote.name} for ${quote.offer.toLocaleString("en-US", {
            currency: "usd",
          })}`}
          submit={result => socket.completeCurrentTask(result)}
          prompt={<PropertyQuoteDisplay quote={quote} state={state} />}
        />
      );
    }
    case DecisionMakerTask.DecideToAcceptTransferLoanQuote: {
      const state = socket.gameState();
      const quote = task.event as TransferLoanQuote;
      const action = quote.creditor === socket.playerId ? "Sell" : "Buy";
      return (
        <SimpleYesNo
          yesOverride={`${action} loan for ${quote.offer.toLocaleString("en-US", {
            currency: "usd",
          })}`}
          submit={result => socket.completeCurrentTask(result)}
          prompt={<TransferLoanQuoteDisplay quote={quote} state={state} />}
        />
      );
    }
    case DecisionMakerTask.DecideToBuyCurrentPropertyFromBank: {
      const state = socket.gameState();
      const boardPosition = state.board.positions[socket.player.position] as BoardPosition<
        PositionType.Property | PositionType.Utility | PositionType.Railroad
      >;
      const property = state.propertyStore.get(boardPosition.propertyId);
      // TODO: highlight property color if applicable
      return (
        <SimpleYesNo
          yesOverride={`Buy ${property.name} for ${property.basePrice.toLocaleString("en-US", {
            currency: "usd",
          })}`}
          submit={result => socket.completeCurrentTask(result)}
          prompt={`Would you like to buy ${property.name} for ${property.basePrice.toLocaleString(
            "en-US",
            { currency: "usd" }
          )}?`}
        />
      );
    }

    case DecisionMakerTask.DecideToPayToGetOutOfJail:
      return (
        <SimpleYesNo
          yesOverride={`Pay ${socket.config.jail.getOfJailBaseCost.toLocaleString("en-US", {
            currency: "usd",
          })}`}
          submit={result => socket.completeCurrentTask(result)}
          prompt={`Would you like to pay ${socket.config.jail.getOfJailBaseCost.toLocaleString(
            "en-US",
            { currency: "usd" }
          )} to get out of jail and move ${
            socket.player.mostRecentRoll![0] + socket.player.mostRecentRoll![1]
          } spaces?`}
        />
      );
    case DecisionMakerTask.DecideToUseGetOutOfJailFreeCard:
      return (
        <SimpleYesNo
          yesOverride={"Use get out of jail free card"}
          submit={result => socket.completeCurrentTask(result)}
          prompt={`Would you like to use 1 (currently have ${
            socket.player.getOutOfJailFreeCards
          }) get out of jail free card to get out of jail and move ${
            socket.player.mostRecentRoll![0] + socket.player.mostRecentRoll![1]
          } spaces?`}
        />
      );
    default:
      assertNever(task.taskType);
  }
  throw new Error("somehow fell through");
};

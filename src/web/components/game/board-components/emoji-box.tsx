import React from "react";
import styled from "@emotion/styled";
import { Tooltip2 } from "@blueprintjs/popover2";
import { GameState, PlayerId } from "common/state/types";

type EmojiBoxProps = {
  position: number;
  state: GameState;
  counter: number;
};

type EmojiProps = {
  emoji: string;
  playerId: PlayerId;
  counter: number;
};
const EmojiWrapper = styled.span`
  cursor: pointer;
`;
const Emoji: React.FC<EmojiProps> = ({ emoji, playerId }) => {
  return (
    <Tooltip2 content={playerId} placement="bottom" fill={true}>
      <EmojiWrapper>{emoji}</EmojiWrapper>
    </Tooltip2>
  );
};

const EmojiBoxInner = styled.span`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 60%;
  font-size: 125%;
  justify-content: space-around;
  align-items: center;
  span {
    margin-right: 2px;
    margin-left: 2px;
  }
`;

export const EmojiBox: React.FC<EmojiBoxProps> = ({ position, state, counter }) => {
  const emojis: EmojiProps[] = [];
  state.playerTurnOrder.forEach(id => {
    const player = state.playerStore.get(id);
    if (player.position !== position) {
      return;
    }
    const emojiProps: EmojiProps = {
      playerId: id,
      emoji: player.emoji,
      counter,
    };
    emojis.push(emojiProps);
  });
  return (
    <EmojiBoxInner>
      {emojis.map(props => (
        <Emoji key={`emoji#${props.playerId}#${position}`} {...props} />
      ))}
    </EmojiBoxInner>
  );
};

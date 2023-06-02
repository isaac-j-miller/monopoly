import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { AnchorButton, Button, Card, FormGroup, NumericInput, Spinner } from "@blueprintjs/core";
import {
  GameConfigParams,
  HumanOrComputerPlayerType,
  PlayerConfigParams,
} from "common/config/types";
import { CreateGameResponse } from "common/shared/types";
import { PlayerId } from "common/state/types";
import { HomeLayout } from "../components/home/layout";
import { PlayerConfigParamDisplay } from "../components/home/player-param-display";
import { HorizontalDiv, SpaceBetweenDiv, VerticalDiv } from "../components/common/flex";

const PlayerDiv = styled(VerticalDiv)`
  width: 50%;
`;

const defaultGameConfig: GameConfigParams = {
  players: [
    {
      id: "Player_0",
      type: HumanOrComputerPlayerType.Human,
    },
    {
      id: "Player_1",
      type: HumanOrComputerPlayerType.Computer,
    },
    {
      id: "Player_2",
      type: HumanOrComputerPlayerType.Computer,
    },
    {
      id: "Player_3",
      type: HumanOrComputerPlayerType.Computer,
    },
    {
      id: "Player_4",
      type: HumanOrComputerPlayerType.Computer,
    },
    {
      id: "Player_5",
      type: HumanOrComputerPlayerType.Computer,
    },
    {
      id: "Player_6",
      type: HumanOrComputerPlayerType.Computer,
    },
    {
      id: "Player_7",
      type: HumanOrComputerPlayerType.Computer,
    },
  ],
  bank: {
    startingMoney: 1000,
    startingInterestRate: 0.05,
    riskiness: 0.5,
  },
};

const getNextPlayerId = (players: PlayerConfigParams[]): PlayerId => {
  let max = 0;
  players.forEach(player => {
    const [t, i] = player.id.split("_");
    const parsed = Number.parseInt(i);
    if (parsed > max) {
      max = parsed;
    }
  });
  const numToUse = max + 1;
  return `Player_${numToUse}`;
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [gameConfigState, setGameConfigState] = React.useState<GameConfigParams>(defaultGameConfig);
  const [isLoading, setIsLoading] = React.useState(false);
  const [resp, setResp] = React.useState<CreateGameResponse>();
  const startGame = () => {
    setIsLoading(true);
    axios
      .post<CreateGameResponse>("/api/create-game", gameConfigState)
      .catch(err => {
        throw err;
      })
      .then(({ data }) => {
        const { gameId } = data;
        navigate(`/lobby/${gameId}`);
      })
      .finally(() => setIsLoading(false));
  };
  return (
    <HomeLayout>
      <Card>
        {resp ? (
          <>
            <h1 className="bp4-heading">Join Game</h1>
            <VerticalDiv>
              {Object.entries(resp.keys).map(([player, key]) => {
                const url = `/game/${key}`;
                return (
                  <HorizontalDiv key={`join:${url}`}>
                    <label>{player}</label>
                    <AnchorButton href={url}>Join Game</AnchorButton>
                  </HorizontalDiv>
                );
              })}
            </VerticalDiv>
          </>
        ) : (
          <>
            <h1 className="bp4-heading">Configure Game</h1>
            {isLoading ? (
              <>
                <Spinner />
              </>
            ) : (
              <VerticalDiv>
                <HorizontalDiv>
                  <PlayerDiv>
                    <SpaceBetweenDiv>
                      <h2 className="bp4-heading">Players</h2>
                      <Button
                        rightIcon={"add"}
                        onClick={() =>
                          setGameConfigState({
                            ...gameConfigState,
                            players: [
                              ...gameConfigState.players,
                              {
                                id: getNextPlayerId(gameConfigState.players),
                                type: HumanOrComputerPlayerType.Computer,
                              },
                            ],
                          })
                        }
                      >
                        New Player
                      </Button>
                    </SpaceBetweenDiv>
                    <VerticalDiv>
                      {gameConfigState.players.map((v, i) => {
                        return (
                          <PlayerConfigParamDisplay
                            data={v}
                            key={v.id}
                            onChangeType={type =>
                              setGameConfigState({
                                ...gameConfigState,
                                players: [
                                  ...gameConfigState.players.slice(0, i),
                                  {
                                    ...v,
                                    type,
                                  },
                                  ...gameConfigState.players.slice(i + 1),
                                ],
                              })
                            }
                            onDelete={() =>
                              setGameConfigState({
                                ...gameConfigState,
                                players: [
                                  ...gameConfigState.players.slice(0, i),
                                  ...gameConfigState.players.slice(i + 1),
                                ],
                              })
                            }
                          />
                        );
                      })}
                    </VerticalDiv>
                  </PlayerDiv>
                  <VerticalDiv>
                    <FormGroup label="Starting Money" labelInfo="(required)">
                      <NumericInput
                        value={gameConfigState.bank.startingMoney}
                        required={true}
                        stepSize={100}
                        majorStepSize={1000}
                        minorStepSize={10}
                        onValueChange={v => {
                          setGameConfigState({
                            ...gameConfigState,
                            bank: {
                              ...gameConfigState.bank,
                              startingMoney: v,
                            },
                          });
                        }}
                      ></NumericInput>
                    </FormGroup>
                    <FormGroup label="Starting Interest Rate" labelInfo="(required)">
                      <NumericInput
                        value={gameConfigState.bank.startingInterestRate}
                        required={true}
                        max={1}
                        min={0}
                        stepSize={0.01}
                        majorStepSize={0.05}
                        minorStepSize={0.001}
                        onValueChange={v => {
                          setGameConfigState({
                            ...gameConfigState,
                            bank: {
                              ...gameConfigState.bank,
                              startingInterestRate: v,
                            },
                          });
                        }}
                      ></NumericInput>
                    </FormGroup>
                    <FormGroup label="Bank Riskiness" labelInfo="(required)">
                      <NumericInput
                        value={gameConfigState.bank.riskiness}
                        required={true}
                        max={1}
                        min={0}
                        majorStepSize={0.2}
                        stepSize={0.1}
                        minorStepSize={0.01}
                        onValueChange={v => {
                          setGameConfigState({
                            ...gameConfigState,
                            bank: {
                              ...gameConfigState.bank,
                              riskiness: v,
                            },
                          });
                        }}
                      ></NumericInput>
                    </FormGroup>
                  </VerticalDiv>
                </HorizontalDiv>
                <HorizontalDiv>
                  <Button onClick={startGame} intent={"success"}>
                    Start Game
                  </Button>
                </HorizontalDiv>
              </VerticalDiv>
            )}
          </>
        )}
      </Card>
    </HomeLayout>
  );
};

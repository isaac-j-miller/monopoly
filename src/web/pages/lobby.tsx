import axios from "axios";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnchorButton, Card, Spinner } from "@blueprintjs/core";
import { CreateGameResponse } from "common/shared/types";
import { HomeLayout } from "../components/home/layout";
import { HorizontalDiv, VerticalDiv } from "../components/common/flex";

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [resp, setResp] = React.useState<CreateGameResponse>();
  React.useEffect(() => {
    setIsLoading(true);
    axios
      .get<CreateGameResponse>(`/api/game/${id}`)
      .then(({ data }) => {
        setResp(data);
      })
      .catch(err => {
        console.error(err);
        navigate("/");
      })
      .finally(() => setIsLoading(false));
  }, [id]);
  return (
    <HomeLayout>
      <Card>
        {isLoading || !resp ? (
          <Spinner />
        ) : (
          <>
            <h1 className="bp4-heading">Join Game</h1>
            <VerticalDiv>
              <HorizontalDiv key={`join:observer`}>
                <label>Observer</label>
                <AnchorButton href={`/game/${resp.observer}`}>Join Game</AnchorButton>
              </HorizontalDiv>
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
        )}
      </Card>
    </HomeLayout>
  );
};

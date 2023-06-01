import React, { PropsWithChildren } from "react";
import styled from "@emotion/styled";

const Root = styled.div`
  display: block;
  width: 100vw;
  height: 100vh;
`;

export const GameLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Root>{children}</Root>;
};

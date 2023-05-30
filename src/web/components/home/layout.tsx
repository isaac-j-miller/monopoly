import React, { PropsWithChildren } from "react";
import styled from "@emotion/styled";

const Root = styled.div`
  display: block;
  width: 100%;
  height: 100%;
`;

export const HomeLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <Root>{children}</Root>;
};

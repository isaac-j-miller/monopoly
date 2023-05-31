import React from "react";
import styled from "@emotion/styled";

export const PositionBaseDiv = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: solid black 1px;
  padding: 0.5px;
  div {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    text-align: center;
    vertical-align: middle;
  }
`;

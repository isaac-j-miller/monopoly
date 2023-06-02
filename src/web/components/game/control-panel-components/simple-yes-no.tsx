import React from "react";
import { HorizontalDiv, VerticalDiv } from "../../common/flex";
import { Button } from "@blueprintjs/core";

type SimpleYesNoProps = {
  prompt: React.ReactNode;
  yesOverride?: string;
  noOverride?: string;
  submit: (result: boolean) => void;
};
export const SimpleYesNo: React.FC<SimpleYesNoProps> = ({
  prompt,
  submit,
  yesOverride,
  noOverride,
}) => {
  return (
    <VerticalDiv>
      <h4 className="bp4-heading">{prompt}</h4>
      <HorizontalDiv>
        <Button onClick={() => submit(false)} intent="danger">
          {noOverride ?? "No"}
        </Button>
        <Button onClick={() => submit(true)} intent="success">
          {yesOverride ?? "Yes"}
        </Button>
      </HorizontalDiv>
    </VerticalDiv>
  );
};

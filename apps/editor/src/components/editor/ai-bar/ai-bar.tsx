import {
  color,
  InvisibleButton,
  Sheet,
  Text,
  fontSize,
  SquareButton,
  BlueButtonParam,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const AIBarContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
`;

const AIBarSheet = styled(Sheet)`
  width: 800px;
  height: 70px;
  padding: 10px 28px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const TaskContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TaskLabel = styled(Text)`
  font-size: ${fontSize("small")};
  line-height: 10px;
  height: 12px;
  padding-bottom: 0px;
  color: ${color("lightText")};
`;

const TaskName = styled(Text)`
  font-size: 18px;
  line-height: 18px;
  height: 18px;
  padding-top: 2px;
`;

const ActionContainer = styled.div`
  height: 100%;
  min-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  border: 1px solid ${color("sheetBorder")};
  padding: 20px;
  box-sizing: border-box;
`;

const ActionName = styled(Text)`
  font-size: 18px;
  line-height: 10px;
  height: 12px;
  padding-top: 2px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ActionButtons = styled(SquareButton)`
  margin: 0px 5px;
`;

const AIContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const AIButton = styled(BlueButtonParam)`
  width: 40px;
  padding: 0;
  margin: 0px 4px;
`;

const SkipButton = styled(InvisibleButton)`
  width: 40px;
  height: 40px;
  margin: 0px;
`;

export const AIBar = observer(() => {
  const store = useStore();
  return store?.editor.activeDocument ? (
    <AIBarContainer>
      <AIBarSheet>
        <TaskContainer>
          <TaskLabel tx="Task" />
          <TaskName tx="Ventricle" />
          <TaskName tx="Segmentation" />
        </TaskContainer>
        <ActionContainer>
          <ActionName tx="Annotate to create ground truth" />
          <ActionButtonsContainer>
            <ActionButtons
              icon="check"
              tooltipTx="export-tooltip"
              tooltipPosition="right"
            />
            <ActionButtons
              icon="redo"
              tooltipTx="export-tooltip"
              tooltipPosition="right"
            />
          </ActionButtonsContainer>
        </ActionContainer>
        <AIContainer>
          <SkipButton icon="arrowLeft" />
          <AIButton
            icon="whoAI"
            tooltipTx="export-tooltip"
            tooltipPosition="right"
          />
          <SkipButton icon="arrowRight" />
        </AIContainer>
      </AIBarSheet>
    </AIBarContainer>
  ) : null;
});

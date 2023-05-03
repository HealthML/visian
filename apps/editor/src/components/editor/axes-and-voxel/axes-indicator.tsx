/* eslint-disable max-len */
import { color, InvisibleButton, Text } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { AxesViewDescription } from "./axes-view-description";

const AxesContainer = styled.div`
  width: 70px;
  height: 80px;
  margin-right: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledRotationButton = styled(InvisibleButton)<{
  left?: boolean;
}>`
  width: 30px;
  height: 30px;
  transform: rotate(${(props) => (props.left ? "-45deg" : "45deg")});
`;

const ButtonRow = styled.div`
  width: 110%;
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AxesVerticalContainer = styled.div`
  width: 54px;
  height: 70px;
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const AxesHorizontalContainer = styled(AxesVerticalContainer)<{
  rotation: number;
  isViewTypeChanged: boolean;
}>`
  flex-direction: row;
  transform: rotate(${(props) => -props.rotation}rad);
  transition: transform ${(props) => (props.isViewTypeChanged ? "0s" : "0.25s")}
    ease-in-out;
`;

const AxisHorizontal = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${color("sheetBorder")};
  margin: 0 6px;
`;

const AxisVertical = styled(AxisHorizontal)`
  width: 1px;
  height: 100%;
  margin: 6px 0;
`;

const AxisText = styled(Text)<{ rotation: number; isViewTypeChanged: boolean }>`
  font-size: 13px;
  font-weight: 500;
  transform: rotate(${(props) => props.rotation}rad);
  transition: transform ${(props) => (props.isViewTypeChanged ? "0s" : "0.25s")}
    ease-in-out;
`;

export const AxesIndicator: React.FC = observer(() => {
  const store = useStore();

  const viewport = store?.editor.activeDocument?.viewport2D;
  const viewType = viewport?.mainViewType;

  const defaultAxisView = AxesViewDescription.fromViewType(
    viewType ?? ViewType.Transverse,
  );

  const [rotation, setRotation] = useState(0);
  const [isViewTypeChanged, setIsViewTypeChanged] = useState(false);

  useEffect(() => {
    setIsViewTypeChanged(true);
  }, [viewType]);

  useEffect(() => {
    switch (viewType) {
      case ViewType.Transverse:
        setRotation(viewport?.rotationT ?? 0);
        break;
      case ViewType.Sagittal:
        setRotation(viewport?.rotationS ?? 0);
        break;
      case ViewType.Coronal:
        setRotation(viewport?.rotationC ?? 0);
        break;
    }
  }, [viewType, viewport?.rotationT, viewport?.rotationC, viewport?.rotationS]);

  useEffect(() => setIsViewTypeChanged(false), [rotation]);

  const rotateLeft = () => viewport?.rotateBy90Degrees(false);
  const rotateRight = () => viewport?.rotateBy90Degrees(true);

  return (
    <AxesContainer>
      {viewType !== undefined && (
        <>
          <ButtonRow>
            <StyledRotationButton left icon="redo" onClick={rotateRight} />
            <StyledRotationButton icon="undo" onClick={rotateLeft} />
          </ButtonRow>
          <AxesHorizontalContainer
            rotation={rotation}
            isViewTypeChanged={isViewTypeChanged}
          >
            <AxisText
              tx={defaultAxisView.left}
              rotation={rotation}
              isViewTypeChanged={isViewTypeChanged}
            />
            <AxisHorizontal />
            <AxisText
              tx={defaultAxisView.right}
              rotation={rotation}
              isViewTypeChanged={isViewTypeChanged}
            />

            <AxesVerticalContainer>
              <AxisText
                tx={defaultAxisView.top}
                rotation={rotation}
                isViewTypeChanged={isViewTypeChanged}
              />
              <AxisVertical />
              <AxisText
                tx={defaultAxisView.bottom}
                rotation={rotation}
                isViewTypeChanged={isViewTypeChanged}
              />
            </AxesVerticalContainer>
          </AxesHorizontalContainer>
        </>
      )}
    </AxesContainer>
  );
});

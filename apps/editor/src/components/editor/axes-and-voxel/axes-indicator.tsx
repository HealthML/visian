/* eslint-disable max-len */
import { color, Text } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { AxesViewDescription } from "./axes-view-description";

const AxesVerticalContainer = styled.div`
  width: 54px;
  height: 70px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
`;

const AxesHorizontalContainer = styled(AxesVerticalContainer)<{
  rotation: number;
  isViewTypeChanged: boolean;
}>`
  flex-direction: row;
  justify-content: normal;
  position: relative;
  transform: rotate(${(props) => -props.rotation}rad);
  transition: transform ${(props) => (props.isViewTypeChanged ? "0s" : "0.25s")}
    ease-in-out;
`;

const AxisHorizontal = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${color("sheetBorder")};
  margin: 0 6px;
  transform-origin: center;
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
  transform-origin: center;
`;

export const AxesIndicator: React.FC = observer(() => {
  const store = useStore();

  const viewport = store?.editor.activeDocument?.viewport2D;
  const viewType = viewport?.mainViewType;

  const axisView = AxesViewDescription.fromViewType(
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

  return (
    <AxesHorizontalContainer
      rotation={rotation}
      isViewTypeChanged={isViewTypeChanged}
    >
      {viewType !== undefined && (
        <>
          <AxisText
            tx={axisView.left}
            rotation={rotation}
            isViewTypeChanged={isViewTypeChanged}
          />
          <AxisHorizontal />
          <AxisText
            tx={axisView.right}
            rotation={rotation}
            isViewTypeChanged={isViewTypeChanged}
          />

          <AxesVerticalContainer>
            <AxisText
              tx={axisView.top}
              rotation={rotation}
              isViewTypeChanged={isViewTypeChanged}
            />
            <AxisVertical />
            <AxisText
              tx={axisView.bottom}
              rotation={rotation}
              isViewTypeChanged={isViewTypeChanged}
            />
          </AxesVerticalContainer>
        </>
      )}
    </AxesHorizontalContainer>
  );
});

/* eslint-disable max-len */
import { Text, FlexRow, Spacer, FlexColumn, color } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const AxesHorizontalContainer = styled.div`
  width: 54px;
  height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 20px;
  position: relative;
`;

const AxesVerticalContainer = styled(AxesHorizontalContainer)`
  flex-direction: column;
  justify-content: center;
  position: absolute;
`;

const AxesHorizontal = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${color("sheetBorder")};
  margin: 0 6px;
`;

const AxesVertical = styled(AxesHorizontal)`
  width: 1px;
  height: 100%;
  margin: 6px 0;
`;

const VoxelTitle = styled(Text)`
  font-size: 13px;
  font-weight: 700;
  margin-right: 10px;
`;

const VoxelContent = styled(Text)`
  font-size: 13px;
  font-weight: 500;
`;

export const AxesAndVoxel: React.FC = observer(() => {
  const store = useStore();

  const viewType = store?.editor.activeDocument?.viewport2D.mainViewType;

  return store?.editor.activeDocument?.viewSettings.viewMode === "2D" ? (
    <FlexRow>
      {store?.editor.activeDocument?.has3DLayers && (
        <AxesHorizontalContainer>
          {viewType !== undefined && (
            <>
              {viewType === ViewType.Sagittal ? (
                <>
                  <VoxelContent tx="A" />
                  <AxesHorizontal />
                  <VoxelContent tx="P" />
                </>
              ) : (
                <>
                  <VoxelContent tx="R" />
                  <AxesHorizontal />
                  <VoxelContent tx="L" />
                </>
              )}
              {viewType === ViewType.Transverse ? (
                <AxesVerticalContainer>
                  <VoxelContent tx="A" />
                  <AxesVertical />
                  <VoxelContent tx="P" />
                </AxesVerticalContainer>
              ) : (
                <AxesVerticalContainer>
                  <VoxelContent tx="S" />
                  <AxesVertical />
                  <VoxelContent tx="I" />
                </AxesVerticalContainer>
              )}
            </>
          )}
        </AxesHorizontalContainer>
      )}
      {store?.editor.activeDocument?.viewport2D.isVoxelHovered &&
        store?.editor.activeDocument?.viewport2D.showVoxelInfo && (
          <FlexColumn>
            <FlexRow>
              <VoxelTitle tx="X" />
              <VoxelContent
                tx={
                  (
                    store?.editor.activeDocument?.viewport2D.hoveredVoxel.x + 1
                  ).toString() ?? "-"
                }
              />
            </FlexRow>
            <FlexRow>
              <VoxelTitle tx="Y" />
              <VoxelContent
                tx={
                  (
                    store?.editor.activeDocument?.viewport2D.hoveredVoxel.y + 1
                  ).toString() ?? "-"
                }
              />
            </FlexRow>
            {store?.editor.activeDocument?.has3DLayers && (
              <FlexRow>
                <VoxelTitle tx="Z" />
                <VoxelContent
                  tx={
                    (
                      store?.editor.activeDocument?.viewport2D.hoveredVoxel.z +
                      1
                    ).toString() ?? "-"
                  }
                />
              </FlexRow>
            )}
            <Spacer />
            <FlexRow>
              <VoxelTitle tx="V" />
              <VoxelContent
                tx={
                  store?.editor.activeDocument?.viewport2D.hoveredValue
                    .toString()
                    .replace(/,/g, ", ") ?? "-"
                }
              />
            </FlexRow>
          </FlexColumn>
        )}
    </FlexRow>
  ) : null;
});

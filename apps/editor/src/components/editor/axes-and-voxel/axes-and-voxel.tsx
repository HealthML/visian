import { FlexColumn, FlexRow, Spacer, Text } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { AxesIndicator } from "./axes-indicator";

const BottomAlignedFlexRow = styled(FlexRow)`
  align-items: flex-end;
`;

const VoxelContainer = styled.div`
  height: 70px;
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

  return store?.editor.activeDocument?.viewSettings.viewMode === "2D" ? (
    <BottomAlignedFlexRow>
      {store?.editor.activeDocument?.has3DLayers && <AxesIndicator />}

      {store?.editor.activeDocument?.viewport2D.isVoxelHovered &&
        store?.editor.activeDocument?.viewport2D.showVoxelInfo &&
        !store?.editor.activeDocument?.tools.isCursorOverFloatingUI && (
          <VoxelContainer>
            <FlexColumn>
              {(store?.editor.activeDocument?.has3DLayers ||
                store?.editor.activeDocument?.viewport2D.mainViewType !==
                  ViewType.Sagittal) && (
                <FlexRow>
                  <VoxelTitle tx="X" />
                  <VoxelContent
                    tx={
                      (
                        (store?.editor.activeDocument?.viewport2D.hoveredVoxel
                          .x || 0) + 1
                      ).toString() ?? "-"
                    }
                  />
                </FlexRow>
              )}
              {(store?.editor.activeDocument?.has3DLayers ||
                store?.editor.activeDocument?.viewport2D.mainViewType !==
                  ViewType.Coronal) && (
                <FlexRow>
                  <VoxelTitle tx="Y" />
                  <VoxelContent
                    tx={
                      (
                        (store?.editor.activeDocument?.viewport2D.hoveredVoxel
                          .y || 0) + 1
                      ).toString() ?? "-"
                    }
                  />
                </FlexRow>
              )}
              {(store?.editor.activeDocument?.has3DLayers ||
                store?.editor.activeDocument?.viewport2D.mainViewType !==
                  ViewType.Transverse) && (
                <FlexRow>
                  <VoxelTitle tx="Z" />
                  <VoxelContent
                    tx={
                      (
                        (store?.editor.activeDocument?.viewport2D.hoveredVoxel
                          .z || 0) + 1
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
                      .toArray()
                      .map((value) =>
                        Number.isInteger(value)
                          ? value.toString()
                          : value.toFixed(5),
                      )
                      .join(", ") ?? "-"
                  }
                />
              </FlexRow>
            </FlexColumn>
          </VoxelContainer>
        )}
    </BottomAlignedFlexRow>
  ) : null;
});

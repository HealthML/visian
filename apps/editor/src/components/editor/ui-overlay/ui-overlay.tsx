import {
  AbsoluteCover,
  color,
  coverMixin,
  DropZone,
  FlexRow,
  Spacer,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { SideViews } from "../side-views";
import { UIOverlayProps } from "./ui-overlay.props";

const Container = styled(AbsoluteCover)`
  align-items: stretch;
  display: flex;
  padding: 12px;
  z-index: 1;
  pointer-events: none;
  user-select: none;
`;

const StyledDropZone = styled(DropZone)`
  flex: 1;
  margin: 10% 0 10% 10%;
`;

const DropSheet = styled.div`
  ${coverMixin}

  align-items: stretch;
  background-color: ${color("modalUnderlay")};
  display: flex;
  flex-direction: row;
  padding-right: 10%;
`;

export const UIOverlay = observer<UIOverlayProps>(
  ({ isDraggedOver, onDropCompleted, ...rest }) => {
    const store = useStore();

    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const importImage = useCallback(
      (files: FileList) => {
        (async () => {
          setIsLoadingImage(true);
          try {
            await store?.editor.importImage(files[0]);
          } catch (e) {
            // TODO: Display error
            console.error(e);
          }
          onDropCompleted();
          setIsLoadingImage(false);
        })();
      },
      [onDropCompleted, store],
    );

    const [isLoadingAnnotation, setIsLoadingAnnotation] = useState(false);
    const importAnnotation = useCallback(
      (files: FileList) => {
        (async () => {
          setIsLoadingAnnotation(true);
          try {
            await store?.editor.importAnnotation(files[0]);
          } catch (e) {
            // TODO: Display error
            console.error(e);
          }
          onDropCompleted();
          setIsLoadingAnnotation(false);
        })();
      },
      [onDropCompleted, store],
    );

    return (
      <Container {...rest}>
        <Text tx="replace-me" />
        <Spacer />
        <SideViews />

        {isDraggedOver && (
          <DropSheet>
            <StyledDropZone
              isAlwaysVisible
              labelTx={isLoadingImage ? "loading" : "drop-image"}
              onFileDrop={importImage}
            />
            <StyledDropZone
              isAlwaysVisible
              labelTx={isLoadingAnnotation ? "loading" : "drop-annotation"}
              onFileDrop={importAnnotation}
            />
          </DropSheet>
        )}
      </Container>
    );
  },
);

export default UIOverlay;

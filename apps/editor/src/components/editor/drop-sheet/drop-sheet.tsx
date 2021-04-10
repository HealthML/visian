import { color, coverMixin, DropZone } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { DropSheetProps } from "./drop-sheet.props";

const StyledDropZone = styled(DropZone)`
  flex: 1;
  margin: 10% 0 10% 10%;
`;

const StyledOverlay = styled.div`
  ${coverMixin}

  align-items: stretch;
  background-color: ${color("modalUnderlay")};
  display: flex;
  flex-direction: row;
  padding-right: 10%;
`;

export const DropSheet: React.FC<DropSheetProps> = observer(
  ({ onDropCompleted }) => {
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
      <StyledOverlay>
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
      </StyledOverlay>
    );
  },
);

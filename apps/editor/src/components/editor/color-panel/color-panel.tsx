import {
  Color,
  dataColorKeys,
  List,
  ListItem,
  Modal,
  ModalProps,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const LayerList = styled(List)`
  margin-top: -16px;
  margin-bottom: 10px;
`;

const ColorList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-left: -12px;
`;

const StyledColor = styled(Color)`
  cursor: pointer;
  margin: 6px 0 6px 12px;
`;

export const ColorPanel = observer((props: ModalProps) => {
  const store = useStore();
  const setColor = useCallback(
    (value: string) => {
      store?.editor.viewSettings.setAnnotationColor(value);
    },
    [store],
  );

  const currentColor = store?.editor.viewSettings.annotationColor;
  return (
    <Modal {...props} labelTx="color-panel">
      <LayerList>
        {currentColor && (
          <ListItem icon={{ color: currentColor }} label={currentColor} />
        )}
      </LayerList>
      <ColorList>
        {dataColorKeys.map((color) => (
          <StyledColor
            key={color}
            color={color}
            isSelected={color === currentColor}
            onPointerDown={() => setColor(color)}
          />
        ))}
      </ColorList>
    </Modal>
  );
});

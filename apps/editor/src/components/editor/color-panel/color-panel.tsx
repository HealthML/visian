import { Color, List, ListItem, Modal, Theme } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";

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

const ColorSelected = styled(StyledColor)`
  border: 2px solid #fff;
`;

export const ColorPanel: React.FC = observer(() => {
  const theme = useTheme() as Theme;

  const store = useStore();
  const setColor = useCallback(
    (value: string) => {
      store?.editor.viewSettings.setAnnotationColor(value);
    },
    [store],
  );

  return (
    <Modal labelTx="color-panel">
      <LayerList>
        <ListItem label="Salient Safran" />
      </LayerList>
      <ColorList>
        {Object.entries(theme.colors.data).map(([name, color]) =>
          store?.editor.viewSettings.annotationColor === color ? (
            <ColorSelected key={name} color={color} />
          ) : (
            <StyledColor
              key={name}
              color={color}
              onPointerDown={() => setColor(color)}
            />
          ),
        )}
      </ColorList>
    </Modal>
  );
});

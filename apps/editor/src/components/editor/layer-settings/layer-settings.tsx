import { Color, dataColorKeys, List, ListItem, Modal } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { LayerSettingsProps } from "./layer-settings.props";

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

export const LayerSettings = observer<LayerSettingsProps>(
  ({ layer, ...rest }) => (
    <Modal {...rest} labelTx="color-panel">
      <LayerList>
        {layer.color && (
          <ListItem icon={{ color: layer.color }} label={layer.color} />
        )}
      </LayerList>
      <ColorList>
        {dataColorKeys.map((color) => (
          <StyledColor
            key={color}
            color={color}
            isSelected={color === layer.color}
            onPointerDown={() => layer.setColor(color)}
          />
        ))}
      </ColorList>
    </Modal>
  ),
);

import { Modal, List, ListItem } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

const LayerList = styled(List)`
  margin-top: -16px;
  margin-bottom: 10px;
`;

const ColorList = styled.div`
  width: 100%;
  display: flex;
  margin: 5px 0;
`;

const Color = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  margin-right: 10px;
  background-color: #d0c068;
  cursor: pointer;
`;

const ColorLast = styled(Color)`
  margin-right: 0px;
`;

const ColorSelected = styled(Color)`
  border: 1px solid #fff;
  width: 18px;
  height: 18px;
`;

export const ColorPanel: React.FC = () => (
  <Modal labelTx="color-panel">
    <LayerList>
      <ListItem label="Salient Safran" />
    </LayerList>
    <ColorList>
      <Color />
      <Color />
      <ColorSelected />
      <Color />
      <Color />
      <Color />
      <ColorLast />
    </ColorList>
    <ColorList>
      <Color />
      <Color />
      <Color />
      <Color />
      <Color />
      <Color />
      <ColorLast />
    </ColorList>
    <ColorList>
      <Color />
      <Color />
      <Color />
      <Color />
      <Color />
      <Color />
      <ColorLast />
    </ColorList>
  </Modal>
);

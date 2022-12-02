import {
  Box,
  FlexRow,
  Screen,
  Text,
  useIsDraggedOver,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { Menu } from "../components/editor";

export const ProjectsScreen: React.FC = observer(() => {
  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();

  const Navbar = styled(FlexRow)`
    position: relative;
    overflow: hidden;
    padding: 3rem;
    background: #ff0000;
  `;

  const Searchbar = styled(Text)`
    font-size: 2rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `;

  const BoxRight = styled(Box)`
    font-size: 2rem;
    position: absolute;
    top: 50%;
    left: calc(100% - 3rem);
    transform: translate(-100%, -50%);
    background: #00ff00;
  `;

  const MyMenu = styled(Menu)`
    margin: 0px;
  `;

  const TextRight = styled(Text)`
    font-size: 2rem;
    position: absolute;
    top: 50%;
    left: calc(100% - 3rem);
    transform: translate(-100%, -50%);
  `;

  return (
    <Screen {...dragListeners} title="VISIAN Projects">
      <Navbar>
        <Searchbar>Test</Searchbar>
        <BoxRight>
          <MyMenu />
        </BoxRight>
      </Navbar>
    </Screen>
  );
});

export default ProjectsScreen;

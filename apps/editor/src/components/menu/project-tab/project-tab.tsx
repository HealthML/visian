import { Box, Switch, Theme } from "@visian/ui-shared";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";

const StyledBox = styled(Box)`
  width: 50%;
  height: 10%;
`;

const projectTabSwitchOptions = [
  { labelTx: "Datasets", value: "datasets" },
  { labelTx: "Jobs", value: "jobs" },
];

const tabSelection = "datasets";

function toggleTabSelection(newValue: string) {
  const pathParts = window.location.pathname.split("/");
  pathParts[pathParts.length - 1] = newValue;
  window.location.pathname = pathParts.join("/");
}

export const ProjectTab = () => {
  const theme = useTheme() as Theme;

  return (
    <StyledBox>
      <Switch
        infoBaseZIndex={theme.zIndices.overlay}
        options={projectTabSwitchOptions}
        // with store?
        value={tabSelection}
        onChange={(newValue) => toggleTabSelection(newValue)}
      />
    </StyledBox>
  );
};

import { Box, Switch, Theme } from "@visian/ui-shared";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";

const StyledBox = styled(Box)`
  width: 50%;
  height: 10%;
`;

const projectTabSwitchOptions = [
  { labelTx: "Datasets", value: "datasets" },
  { labelTx: "Jobs", value: "jobs" },
];

const defaultTabSelection = "datasets";
export const ProjectTab = () => {
  const theme = useTheme() as Theme;
  const navigate = useNavigate();

  // expect path like /project/projectId/datasets
  const handleChange = (newValue: string) => {
    const pathParts = window.location.pathname.split("/");
    pathParts[pathParts.length - 1] = newValue;
    navigate(pathParts.join("/"));
  };

  return (
    <StyledBox>
      <Switch
        infoBaseZIndex={theme.zIndices.overlay}
        options={projectTabSwitchOptions}
        // with store?
        value={defaultTabSelection}
        onChange={(newValue) => handleChange(newValue)}
      />
    </StyledBox>
  );
};

import { Box, Switch, Theme } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";

const StyledSwitch = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20vw;
`;

const projectViewSwitchOptions = [
  { labelTx: "Datasets", value: "datasets" },
  { labelTx: "Jobs", value: "jobs" },
];

export const ProjectViewSwitch = () => {
  const theme = useTheme() as Theme;
  const navigate = useNavigate();
  const match = useMatch("projects/:projectId/*");

  const [selectedOption, setSelectedOption] = useState(
    match?.params?.["*"] || "datasets",
  );

  const changeScreen = useCallback(
    (screenName: string) => {
      setSelectedOption(screenName);
      navigate(`./${screenName}`);
    },
    [navigate],
  );

  return (
    <StyledSwitch>
      <Switch
        infoBaseZIndex={theme.zIndices.overlay}
        options={projectViewSwitchOptions}
        value={selectedOption}
        onChange={changeScreen}
      />
    </StyledSwitch>
  );
};

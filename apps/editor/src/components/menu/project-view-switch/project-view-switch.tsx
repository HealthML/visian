import { Box, Switch, Theme } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
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

export const ProjectViewSwitch = ({
  defaultSwitchSelection,
}: {
  defaultSwitchSelection: string;
}) => {
  const theme = useTheme() as Theme;
  const navigate = useNavigate();

  // expect path like /project/projectId/datasets
  const navigateToScreen = (screenName: string) => {
    const newPathname = window.location.pathname.replace(
      /\/[^/]*$/,
      `/${screenName}`,
    );
    navigate(newPathname);
  };

  return (
    <StyledSwitch>
      <Switch
        infoBaseZIndex={theme.zIndices.overlay}
        options={projectViewSwitchOptions}
        value={defaultSwitchSelection}
        onChange={(screenName) => navigateToScreen(screenName)}
      />
    </StyledSwitch>
  );
};

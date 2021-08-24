import { PopUp, Text, fontWeight, Icon } from "@visian/ui-shared";
import styled from "styled-components";

export const SettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SettingsColumnContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: auto;
`;

export const SettingsGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

export const GroupTitle = styled(Text)`
  font-size: 22px;
  font-weight: ${fontWeight("regular")};
`;

export const GroupTitleContainer = styled.div`
  margin-bottom: 14px;
  width: 100%;
`;

export const SettingsLabel = styled(Text)`
  font-size: 14px;
  margin-left: 12px;
`;

export const SettingsDescription = styled(Text)`
  font-size: 17px;
  font-weight: ${fontWeight("default")};
`;

export const SettingsRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 16px;
  align-items: center;
`;

export const SettingsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 30%;
  align-items: center;
`;

export const SettingsDescriptionContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 70%;
  align-items: center;
`;

export const SettingsPopUpContainer = styled(PopUp)`
  align-items: center;
  width: 80%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  height: 80%;
  max-height: 800px;
`;

export const PlusIcon = styled(Icon).attrs(() => ({ icon: "plusSmall" }))`
  margin: 0 8px;
  height: 7px;
  width: 7px;
`;

export const MouseIcon = styled(Icon)`
  height: 26px;
  width: 20px;
`;

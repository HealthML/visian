import { PopUp, Text, fontWeight, Icon } from "@visian/ui-shared";
import styled from "styled-components";

export const ShortcutColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const ShortcutColumnContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: auto;
`;

export const ShortcutGroup = styled.div`
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

export const ShortcutLabel = styled(Text)`
  font-size: 14px;
  margin-left: 12px;
`;

export const ShortcutDescription = styled(Text)`
  font-size: 17px;
  font-weight: ${fontWeight("default")};
`;

export const ShortcutRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 16px;
  align-items: center;
`;

export const ShortcutContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 30%;
  align-items: center;
`;

export const ShortcutDescriptionContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 70%;
  align-items: center;
`;

export const ShortcutPopUpContainer = styled(PopUp)`
  align-items: center;
  width: 80%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  height: 80%;
  max-height: 800px;
`;

export const PlusIcon = styled(Icon).attrs(() => ({ icon: "plusIcon" }))`
  margin: 0 8px;
  height: 7px;
  width: 7px;
`;

export const MouseIcon = styled(Icon)`
  height: 26px;
  width: 20px;
`;

import { fontWeight, Icon, Text } from "@visian/ui-shared";
import styled from "styled-components";

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

export const ShortcutContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: row;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "30%")};
  align-items: center;
`;

export const ShortcutDescriptionContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 70%;
  align-items: center;
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

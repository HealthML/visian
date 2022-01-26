import styled from "styled-components";
import { fontWeight } from "../../theme";
import { Text } from "../text";
import { PopUp } from "./popup";

export const LargePopUpColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const LargePopUpColumnContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: auto;
`;

export const LargePopUpGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

export const LargePopUpGroupTitle = styled(Text)`
  font-size: 22px;
  font-weight: ${fontWeight("regular")};
`;

export const LargePopUpGroupTitleContainer = styled.div`
  margin-bottom: 14px;
  width: 100%;
`;

export const LargePopUp = styled(PopUp)`
  align-items: center;
  width: 80%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  height: 80%;
  max-height: 800px;
`;

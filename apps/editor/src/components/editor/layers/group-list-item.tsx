import {
  computeStyleValue,
  ILayerFamily,
  ListItem,
  size,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

const FamilyItem = styled(ListItem)`
  max-height: ${computeStyleValue(
    [size("listElementHeight"), size("dividerHeight")],
    (listElementHeight, dividerHeight) =>
      6 * (listElementHeight + dividerHeight),
  )};
  max-width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  border: none;
`;

export const FamilyListItem = observer<{
  family: ILayerFamily;
  isActive: boolean;
}>(({ family, isActive }) => (
  <FamilyItem
    icon={
      family.collapsed ||
      family.collapsed === undefined ||
      family.layers.length === 0
        ? "arrowRight"
        : "arrowDown"
    }
    labelTx={family.id}
    label={family.id}
    isActive={isActive}
  />
));

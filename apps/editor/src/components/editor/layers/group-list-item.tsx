import { FixedWidthListItem, ILayerFamily } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";

export const FamilyListItem = observer<{
  family: ILayerFamily;
  isActive: boolean;
  isLast: boolean | undefined;
}>(({ family, isActive, isLast }) => (
  <FixedWidthListItem
    icon={family.collapsed ? "arrowRight" : "arrowDown"}
    onClick={() => {
      family.collapsed = !family.collapsed;
    }}
    labelTx={family.title}
    label={family.title}
    isActive={isActive}
    isLast={isLast}
  />
));

import { FixedWidthListItem, ILayerFamily } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";

export const FamilyListItem = observer<{
  family: ILayerFamily;
  isActive: boolean;
  isLast: boolean | undefined;
}>(({ family, isActive, isLast }) => {
  const toggleCollapse = useCallback(() => {
    family.collapsed = !family.collapsed;
  }, [family]);
  return (
    <FixedWidthListItem
      icon={family.collapsed ? "arrowRight" : "arrowDown"}
      onClick={toggleCollapse}
      labelTx={family.title}
      label={family.title}
      isActive={isActive}
      isLast={isLast}
    />
  );
});

import { FullWidthListItem, IAnnotationGroup } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";

export const AnnotationGroupListItem = observer<{
  group: IAnnotationGroup;
  isActive: boolean;
  isLast?: boolean;
}>(({ group, isActive, isLast }) => {
  const toggleCollapse = useCallback(() => {
    group.collapsed = !group.collapsed;
  }, [group]);
  return (
    <FullWidthListItem
      icon={group.collapsed ? "arrowRight" : "arrowDown"}
      onClick={toggleCollapse}
      labelTx={group.title}
      label={group.title}
      isActive={isActive}
      isLast={isLast}
    />
  );
});

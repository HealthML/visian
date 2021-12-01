import {
  PointerButton,
  ToolGroup as GenericToolGroup,
  ToolProps,
  useMultiRef,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";

import { Tool } from "./tool";

import type { ToolGroup as ToolGroupModel, ToolName } from "../../../models";

export const ToolGroup = observer<
  Pick<ToolProps, "onPress" | "showTooltip"> & {
    toolGroup: ToolGroupModel<ToolName>;
  },
  HTMLButtonElement
>(
  ({ toolGroup, onPress, showTooltip }, ref) => {
    const [innerToolRef, setInnerToolRef] = useState<HTMLButtonElement | null>(
      null,
    );
    const toolRef = useMultiRef(ref, setInnerToolRef);

    const [isExpanded, setIsExpanded] = useState(false);
    const dismiss = useCallback(() => {
      setIsExpanded(false);
    }, []);

    const handlePress = useCallback(
      (
        value: string | number | undefined,
        event: React.PointerEvent<HTMLButtonElement>,
      ) => {
        onPress?.(value, event);

        if (
          toolGroup.activeTool.isActive &&
          event.button === PointerButton.LMB
        ) {
          setIsExpanded(true);
        }
      },
      [onPress, toolGroup],
    );

    const activateTool = useCallback(
      (value: string | number | undefined) => {
        toolGroup.setActiveTool(value as ToolName);
        setIsExpanded(false);
      },
      [toolGroup],
    );

    const hasActivateableTool = toolGroup.tools.some((tool) =>
      tool.canActivate(),
    );
    return hasActivateableTool ? (
      <>
        <Tool
          tool={toolGroup.activeTool}
          showTooltip={showTooltip && !isExpanded}
          ref={toolRef}
          onPress={handlePress}
        />
        <GenericToolGroup
          isOpen={isExpanded}
          anchor={innerToolRef}
          position="right"
          onOutsidePress={dismiss}
        >
          {toolGroup.tools.map((tool) => (
            <Tool key={tool.name} tool={tool} onPress={activateTool} />
          ))}
        </GenericToolGroup>
      </>
    ) : null;
  },
  { forwardRef: true },
);

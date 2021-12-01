import {
  PointerButton,
  ToolGroup as GenericToolGroup,
  ToolProps,
  useMultiRef,
  useShortTap,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";

import { Tool } from "./tool";

import type { ToolGroup as ToolGroupModel, ToolName } from "../../../models";

export const ToolGroup = observer<
  Pick<ToolProps, "onPress" | "onRelease" | "showTooltip"> & {
    toolGroup: ToolGroupModel<ToolName>;
    canExpand?: boolean;
  },
  HTMLButtonElement
>(
  ({ toolGroup, canExpand = true, onPress, onRelease, showTooltip }, ref) => {
    const [innerToolRef, setInnerToolRef] = useState<HTMLButtonElement | null>(
      null,
    );
    const toolRef = useMultiRef(ref, setInnerToolRef);

    const [isExpanded, setIsExpanded] = useState(false);
    const dismiss = useCallback(() => {
      setIsExpanded(false);
    }, []);

    const [startTap, stopTap] = useShortTap(
      useCallback(
        (event: React.PointerEvent) => {
          if (
            toolGroup.activeTool.isActive &&
            event.button === PointerButton.LMB
          ) {
            setIsExpanded(true);
          }
        },
        [toolGroup],
      ),
      undefined,
      canExpand && !isExpanded && toolGroup.activeTool.isActive,
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
          onPress={onPress}
          onRelease={onRelease}
          onPointerDown={startTap}
          onPointerUp={stopTap}
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

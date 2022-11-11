import {
  ToolGroup as GenericToolGroup,
  PointerButton,
  ToolProps,
  useMultiRef,
  useShortTap,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";

import { useStore } from "../../../app/root-store";
import type { ToolGroup as ToolGroupModel, ToolName } from "../../../models";
import { Tool } from "./tool";

export const ToolGroup = observer<
  Pick<ToolProps, "onPress" | "onRelease" | "showTooltip"> & {
    toolGroup: ToolGroupModel<ToolName>;
    canExpand?: boolean;
  },
  HTMLButtonElement
>(
  ({ toolGroup, canExpand = true, onPress, onRelease, showTooltip }, ref) => {
    const store = useStore();

    const [innerToolRef, setInnerToolRef] = useState<HTMLButtonElement | null>(
      null,
    );
    const toolRef = useMultiRef(ref, setInnerToolRef);

    const [isHovered, setIsHovered] = useState(false);
    const hover = useCallback(() => {
      setIsHovered(true);
    }, []);
    const unhover = useCallback(() => {
      setIsHovered(false);
    }, []);

    const [isExpanded, setIsExpanded] = useState(false);
    const expand = useCallback(() => {
      setIsExpanded(true);
    }, []);
    const dismiss = useCallback(() => {
      setIsExpanded(false);
    }, []);

    const [startTap, stopTap] = useShortTap(
      useCallback(
        (event: React.PointerEvent) => {
          if (
            event.button === PointerButton.LMB &&
            toolGroup.activeTool.isActive &&
            toolGroup.tools.length > 1
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
        store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
      },
      [toolGroup, store],
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
          onPointerOver={hover}
          onPointerOut={unhover}
          onPress={onPress}
          onRelease={onRelease}
          onPointerDown={startTap}
          onPointerUp={stopTap}
        />
        <GenericToolGroup
          showHint={toolGroup.tools.length > 1}
          expandHint={isHovered}
          isOpen={isExpanded}
          anchor={innerToolRef}
          position="right"
          onPressHint={expand}
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

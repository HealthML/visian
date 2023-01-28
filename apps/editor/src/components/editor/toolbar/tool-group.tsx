import {
  ToolGroup as GenericToolGroup,
  PointerButton,
  ToolProps,
  useForwardEvent,
  useLongPress,
  useMultiRef,
  useShortTap,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";

import { useStore } from "../../../app/root-store";
import {
  SelfDeactivatingTool,
  ToolGroup as ToolGroupModel,
  ToolName,
} from "../../../models";
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

    // Short tap on active tool opens settings
    const [startTap, stopTap] = useShortTap(
      useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
          if (event.button === PointerButton.LMB) {
            store?.editor.activeDocument?.tools.setShowToolSettings(true);
          }
        },
        [store],
      ),
      undefined,
      toolGroup.activeTool.isActive &&
        !(toolGroup.activeTool instanceof SelfDeactivatingTool) &&
        !store?.editor.activeDocument?.tools.showToolSettings,
    );

    // Short tap on inactive tool makes it active
    const [startTap2, stopTap2] = useShortTap(
      useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
          if (event.button === PointerButton.LMB) {
            store?.editor.activeDocument?.tools.setActiveTool(
              toolGroup.activeTool,
            );
          }
        },
        [store, toolGroup],
      ),
      undefined,
      !toolGroup.activeTool.isActive,
    );

    // Long press expands group
    const [startPress, stopPress] = useLongPress(
      useCallback(
        (event: React.PointerEvent) => {
          if (
            event.button === PointerButton.LMB &&
            toolGroup.tools.length > 1
          ) {
            setIsExpanded(true);
          }
        },
        [toolGroup],
      ),
      undefined,
      canExpand && !isExpanded,
    );

    const handlePointerDown = useForwardEvent(
      startTap,
      startTap2,
      startPress,
      useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
          if (
            event.button === PointerButton.RMB &&
            toolGroup.tools.length > 1
          ) {
            setIsExpanded(canExpand && !isExpanded);
          }
        },
        [canExpand, isExpanded, toolGroup],
      ),
    );
    const handlePointerUp = useForwardEvent(stopTap, stopTap2, stopPress);

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
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
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

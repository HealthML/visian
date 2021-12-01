import {
  ITool,
  preventDefault,
  Tool as GenericTool,
  ToolProps,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";

import type { ToolName } from "../../../models";

export const Tool = observer<
  Pick<ToolProps, "onPress" | "showTooltip"> & {
    tool: ITool<ToolName>;
  },
  HTMLButtonElement
>(
  ({ tool, onPress, showTooltip = true }, ref) => (
    <GenericTool
      icon={tool.icon}
      isActive={tool.isActive}
      isDisabled={!tool.canActivate()}
      tooltipTx={tool.labelTx}
      tooltip={tool.label}
      value={tool.name}
      showTooltip={showTooltip}
      ref={ref}
      onPress={onPress}
      onContextMenu={preventDefault}
    />
  ),
  { forwardRef: true },
);

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
  ToolProps & {
    tool: ITool<ToolName>;
  },
  HTMLButtonElement
>(
  ({ tool, ...rest }, ref) => (
    <GenericTool
      {...rest}
      icon={tool.icon}
      isActive={tool.isActive}
      isDisabled={!tool.canActivate()}
      tooltipTx={tool.labelTx}
      tooltip={tool.label}
      value={tool.name}
      ref={ref}
      onContextMenu={preventDefault}
    />
  ),
  { forwardRef: true },
);

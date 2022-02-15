import {
  ITool,
  preventDefault,
  Tool as GenericTool,
  ToolProps,
  useTranslation,
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
  ({ tool, ...rest }, ref) => {
    const { t } = useTranslation();

    const keys = tool.activationKeys && tool.activationKeys.split(",")[0];

    const tooltip = `${tool.labelTx ? t(tool.labelTx) : tool.label}${
      keys
        ? ` (${keys
            .split("+")
            .map((key) => `${key[0].toUpperCase()}${key.substring(1)}`)
            .join("+")})`
        : ""
    }`;
    return (
      <GenericTool
        {...rest}
        icon={tool.icon}
        isActive={tool.isActive}
        isDisabled={!tool.canActivate()}
        tooltip={tooltip}
        value={tool.name}
        ref={ref}
        onContextMenu={preventDefault}
      />
    );
  },
  { forwardRef: true },
);

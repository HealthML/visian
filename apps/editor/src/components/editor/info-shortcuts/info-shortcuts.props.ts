import { IHotkey } from "../../../event-handling/hotkeys";

export interface InfoShortcutsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hotkeys?: IHotkey[];
  hotkeyNames?: string[];
  hotkeyGroupNames?: string[];
}

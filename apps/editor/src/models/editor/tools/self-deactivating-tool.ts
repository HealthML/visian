import { ISelfDeactivatingTool, ITool } from "@visian/ui-shared";
import { Tool } from "./tool";

export class SelfDeactivatingTool<N extends string>
  extends Tool<N>
  implements ISelfDeactivatingTool<N> {
  public readonly isSelfDeactivating = true;

  public activate(previousTool?: ITool<N>) {
    this.document.tools.setActiveTool(previousTool);
  }
}

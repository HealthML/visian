import { ITool } from "@visian/ui-shared";
import { Tool } from "./tool";

export class SelfDeactivatingTool extends Tool {
  public activate(previousTool?: ITool) {
    this.document.tools.setActiveTool(previousTool);
  }
}

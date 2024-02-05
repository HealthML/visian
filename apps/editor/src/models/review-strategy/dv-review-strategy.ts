import { RootStore } from "../root";
import { ReviewStrategy } from "./review-strategy";
import { ReviewStrategySnapshot } from "./review-strategy-snapshot";
import { DVReviewTask } from "./dv-review-task";
import { getDVTask } from "@visian/utils";

export class DVReviewStrategy extends ReviewStrategy {
  public static fromSnapshot(
    store: RootStore,
    snapshot?: ReviewStrategySnapshot,
  ) {
    if (!snapshot) return undefined;
    if (snapshot.backend === "dv") {
      return new DVReviewStrategy({
        store,
        currentReviewTask: snapshot.currentReviewTask
          ? DVReviewTask.fromSnapshot(snapshot.currentReviewTask)
          : undefined,
      });
    }
    return undefined;
  }

  constructor({
    store,
    currentReviewTask,
  }: {
    store: RootStore;
    currentReviewTask?: DVReviewTask;
  }) {
    super({ store });
    if (currentReviewTask) this.setCurrentTask(currentReviewTask);
  }

  public async nextTask(): Promise<void> {
    throw new Error("Next task is not implemented in the DV strategy!");
  }

  public async previousTask() {
    throw new Error("Previous task is not implemented in the DV strategy!");
  }

  public async saveTask(): Promise<void> {
    //TODO: implement saveTask
  }

  // Importing
  protected async buildTask() {
    // TODO: receiving the task id from the url is not implemented yet
    const dvTask = await getDVTask("dv-task-id");

    if (!dvTask) throw new Error("DV Task not found.");
    this.setCurrentTask(new DVReviewTask(dvTask));
  }

  protected async importAnnotations(): Promise<void> {}

  public loadTaskPostProcessing(): void {
    const document = this.store.editor.activeDocument;
    if (!document) throw new Error("No active document");

    const reviewTask = this.currentTask as DVReviewTask;
    reviewTask.addGroupsAndLayers(document);

    document.requestSave();
  }

  public toJSON(): ReviewStrategySnapshot {
    return {
      backend: "dv",
      currentReviewTask: this.currentTask
        ? (this.currentTask as DVReviewTask).toJSON()
        : undefined,
    };
  }
}

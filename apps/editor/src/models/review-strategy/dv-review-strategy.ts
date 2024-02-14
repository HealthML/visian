import { getDvAnnotationTask, getTaskIdFromUrl } from "@visian/utils";

import { RootStore } from "../root";
import { DVReviewTask } from "./dv-review-task";
import { ReviewStrategy } from "./review-strategy";
import { ReviewStrategySnapshot } from "./review-strategy-snapshot";

export class DVReviewStrategy extends ReviewStrategy<DVReviewTask> {
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
    this.currentTask?.save(this.getDocument());
  }

  protected async buildTask() {
    const taskId = getTaskIdFromUrl();
    if (!taskId) throw new Error("No DV task specified in URL.");

    const dvAnnotationTask = await getDvAnnotationTask(taskId);

    if (!dvAnnotationTask) throw new Error("DV Task not found.");
    this.setCurrentTask(new DVReviewTask(dvAnnotationTask));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async importAnnotations(): Promise<void> {}

  public postProcessLoadedTask(): void {
    const document = this.getDocument();
    if (this.currentTask) {
      this.currentTask.addGroupsAndLayers(document);
    }
    document.requestSave();
  }

  public toJSON(): ReviewStrategySnapshot {
    return {
      backend: "dv",
      currentReviewTask: this.currentTask
        ? this.currentTask.toJSON()
        : undefined,
    };
  }
}

import { RootStore } from "../root";
import { ReviewTask } from "./review-task";

export abstract class ReviewStrategy {
  protected task?: ReviewTask;
  protected store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
  }

  public abstract loadTask(): void;
  public get currentTask(): ReviewTask | undefined {
    return this.task;
  }
  public abstract nextTask(): void;
  public abstract saveTask(): void;
}

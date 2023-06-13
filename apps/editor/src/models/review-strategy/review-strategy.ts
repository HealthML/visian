import { action, makeObservable, observable } from "mobx";

import { RootStore } from "../root";
import { ReviewTask } from "./review-task";

export abstract class ReviewStrategy {
  protected store: RootStore;
  protected task?: ReviewTask;

  constructor(store: RootStore) {
    makeObservable<this, "task">(this, {
      task: observable,
      setCurrentTask: action,
    });
    this.store = store;
  }

  public abstract loadTask(): void;
  public setCurrentTask(task: ReviewTask) {
    this.task = task;
  }
  public get currentTask(): ReviewTask | undefined {
    return this.task;
  }
  public abstract nextTask(): void;
  public abstract saveTask(): void;
}

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

  // Called to load the current task into the editor
  public abstract loadTask(): void;

  public setCurrentTask(task: ReviewTask) {
    this.task = task;
  }
  public get currentTask(): ReviewTask | undefined {
    return this.task;
  }

  // Called to get the next task and load it into the editor
  public abstract nextTask(): void;

  // Called to save changes made in the editor to the backend
  public abstract saveTask(): void;
}

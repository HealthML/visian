import { RootStore } from "../root";
import { Task } from "./task";

export abstract class ReviewStrategy {
  private task?: Task;

  protected store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
  }

  public abstract loadTask(): void;
  public get currentTask(): Task | undefined{
    return this.task;
  }
  public abstract nextTask(): void;
  public abstract saveTask(): void;
}

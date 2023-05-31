import { RootStore } from "../root";
import { Task } from "./task";

export abstract class ReviewStrategy {
  public currentTask?: Task;

  protected store: RootStore;

  constructor(store: RootStore) {
    this.store = store;
  }

  public abstract loadTask(): void;
}

export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}

export class Task {
  public title: string;
  public description: string;
  public kind: TaskType;

  constructor(title: string, description: string, kind: TaskType) {
    this.title = title;
    this.description = description;
    this.kind = kind;
  }
}

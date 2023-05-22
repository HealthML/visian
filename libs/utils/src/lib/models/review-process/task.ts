import { TaskImage } from ".";

export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}

export class Task {
  public title: string;
  public description: string;
  public kind: TaskType;
  public images: TaskImage[];

  constructor(
    title: string,
    description: string,
    kind: TaskType,
    images: TaskImage[],
  ) {
    this.title = title;
    this.description = description;
    this.kind = kind;
    this.images = images;
  }
}

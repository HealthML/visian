import { TaskAnnotation } from "./task-annotation";

export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}
export class Task {
  public kind: TaskType;
  public title: string;
  public description: string;
  public imageIds: string[];
  public annotation: TaskAnnotation[];

  constructor(
    kind: TaskType,
    title: string,
    description: string,
    imageIds: string[],
    annotation: TaskAnnotation[],
  ) {
    this.kind = kind;
    this.title = title;
    this.description = description;
    this.imageIds = imageIds;
    this.annotation = annotation;
  }
}

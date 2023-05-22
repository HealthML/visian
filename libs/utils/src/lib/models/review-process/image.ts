import { TaskAnnotation } from "./annotation";

export class TaskImage {
  public id: string;
  public title: string;
  public annotations: TaskAnnotation[];

  constructor(title: string, id: string, annotations: TaskAnnotation[]) {
    this.id = id;
    this.title = title;
    this.annotations = annotations;
  }
}

import { TaskAnnotation } from "./annotation";

export class TaskImage {
  public title: string;
  public data: string;
  public annotations: TaskAnnotation[];

  constructor(title: string, data: string, annotations: TaskAnnotation[]) {
    this.title = title;
    this.data = data;
    this.annotations = annotations;
  }
}

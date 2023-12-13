import { DVAnnotation } from "./annotation";
import { DVAnnotationData } from "./annotationData";

export interface DVAnnotationTaskSnapshot {
  taskUUID: string;
  userID: string;
}

export class DVAnnotationTask {
  public taskUUID: string;
  public userID: string;
  public scan: DVAnnotationData;
  public annotations: DVAnnotation[];

  // TODO: Properly type API response data
  constructor(task: any) {
    this.taskUUID = task.taskUUID;
    this.userID = task.userID;
    this.scan = new DVAnnotationData(task.scan);
    this.annotations = [new DVAnnotation(task.annotationGroup)];
  }

  public toJSON(): DVAnnotationTaskSnapshot {
    return {
      taskUUID: this.taskUUID,
      userID: this.userID,
    };
  }
}

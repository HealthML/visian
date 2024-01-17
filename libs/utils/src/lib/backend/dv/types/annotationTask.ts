import { DVAnnotationGroup } from "./annotationGroup";
import { DVScan as DVScan } from "./scan";
import { DVRois } from "./rois";
import { DVCase } from "./case";

export interface DVAnnotationTaskSnapshot {
  taskID: string;
  userID: string;
  case: any;
}

export class DVAnnotationTask {
  public taskUUID: string;
  public userID: string;
  public scan: DVScan;
  public case: DVCase;
  public annotationGroups: DVAnnotationGroup[];
  public rois: DVRois[];

  // TODO: Properly type API response data
  constructor(task: any) {
    this.taskUUID = task.taskID;
    this.userID = task.userID;
    this.case = new DVCase(task.case);
    this.scan = new DVScan(task.scan);
    this.annotationGroups = this.parseAnnotationGroups(task.annotationGroups);
    this.rois = this.parseRois(task.rois);
  }

  private parseAnnotationGroups(annotationGroups: any): DVAnnotationGroup[] {
    return annotationGroups.map(
      (annotationGroup: any) => new DVAnnotationGroup(annotationGroup),
    );
  }

  private parseRois(rois: any): DVRois[] {
    return rois.map((roi: any) => new DVRois(roi));
  }

  public toJSON(): DVAnnotationTaskSnapshot {
    return {
      taskID: this.taskUUID,
      userID: this.userID,
      case: this.case.toJSON(),
      // TODO complete toJSON
    };
  }
}

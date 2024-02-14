import { DVAnnotationLayer } from "./annotationLayer";
import { DVCase } from "./case";
import { DVRois } from "./rois";
import { DVRoisOfASlice } from "./roisOfASlice";
import { DVScan } from "./scan";

export interface DVAnnotationTaskSnapshot {
  taskID: string;
  userID: string;
  case: any;
  scan: any;
  annotationGroups: any[];
  rois: any[];
}

export class DVAnnotationTask {
  public static createFromImport(jsonObject: any): DVAnnotationTask {
    const { taskID } = jsonObject;
    const { userID } = jsonObject;
    const dvCase = new DVCase(jsonObject.case);
    const scan = new DVScan(jsonObject.scan);
    const rois = this.parseRois(jsonObject.rois);
    const layerUserMapping = this.getLayerUserMapping(rois);
    const annotationLayers = this.parseAnnotationLayers(
      jsonObject.annotationGroups,
      layerUserMapping,
    );

    return new DVAnnotationTask(
      taskID,
      userID,
      dvCase,
      scan,
      annotationLayers,
      rois,
    );
  }

  private static getLayerUserMapping(rois: DVRois[]): Map<string, string> {
    const layerUserMapping = new Map<string, string>();
    rois.forEach((roi) => {
      layerUserMapping.set(roi.layer, roi.user);
    });

    return layerUserMapping;
  }

  private static parseAnnotationLayers(
    annotationGroups: any,
    layerUserMapping: Map<string, string>,
  ): DVAnnotationLayer[] {
    return annotationGroups.map((annotationGroup: any) =>
      DVAnnotationLayer.createFromImport(annotationGroup, layerUserMapping),
    );
  }

  private static parseRois(roisJson: any): DVRois[] {
    return roisJson.map((roi: any) => DVRois.createFromImport(roi));
  }

  public taskID: string;
  public userID: string;
  public scan: DVScan;
  public case: DVCase;
  public annotationLayers: DVAnnotationLayer[];
  public rois: DVRois[];

  constructor(
    taskID: string,
    userID: string,
    dvCase: DVCase,
    scan: DVScan,
    annotationGroups: DVAnnotationLayer[],
    rois: DVRois[],
  ) {
    this.taskID = taskID;
    this.userID = userID;
    this.case = dvCase;
    this.scan = scan;
    this.annotationLayers = annotationGroups;
    this.rois = rois;
  }

  public getLayerRoisList(): DVRoisOfASlice[] {
    const list = [] as DVRoisOfASlice[];
    this.rois.forEach((roi) => {
      const layerRois = roi.getLayerRoisEntry(list);
      layerRois.rois.push(roi.points);
    });
    return list;
  }

  public getNextAnnotationLayerID(): string {
    const maxID = Math.max(
      ...this.annotationLayers.map((m) => parseInt(m.annotationID)),
    );
    return (maxID + 1).toString();
  }

  public toJSON(): DVAnnotationTaskSnapshot {
    return {
      taskID: this.taskID,
      userID: this.userID,
      case: this.case.toJSON(),
      scan: this.scan.toJSON(),
      annotationGroups: this.annotationLayers.map((group) => group.toJSON()),
      rois: this.rois.map((roi) => roi.toJSON()),
    };
  }
}

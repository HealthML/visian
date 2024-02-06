import { DVAnnotationLayer } from "./annotationLayer";
import { DVScan as DVScan } from "./scan";
import { DVRois } from "./rois";
import { DVCase } from "./case";
import { DVRoisOfASlice as DVRoisOfASlice } from "./roisOfASlice";

export interface DVAnnotationTaskSnapshot {
  taskID: string;
  userID: string;
  case: any;
  scan: any;
  annotationGroups: any[];
  rois: any[];
}

export class DVAnnotationTask {
  public taskID: string;
  public userID: string;
  public scan: DVScan;
  public case: DVCase;
  public annotationLayers: DVAnnotationLayer[];
  public rois: DVRois[];

  // TODO: Properly type API response data
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

  static createFromImport(jsonObject: any): DVAnnotationTask {
    const taskID = jsonObject.taskID;
    const userID = jsonObject.userID;
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

  static createFromDocument(document: Document) {}

  private static getLayerUserMapping(rois: DVRois[]): Map<string, string> {
    var layerUserMapping = new Map<string, string>();
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

  private static parseRois(roisJson: any): DVRois[] {
    return roisJson.map((roi: any) => DVRois.createFromImport(roi));
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

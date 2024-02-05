import { DVAnnotationLayer } from "./annotationLayer";
import { DVScan as DVScan } from "./scan";
import { DVRois } from "./rois";
import { DVCase } from "./case";
import { DVLayerRoisEntry as DVLayerRoisEntry } from "./layerRoisEntry";

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
  constructor(task: any) {
    this.taskID = task.taskID;
    this.userID = task.userID;
    this.case = new DVCase(task.case);
    this.scan = new DVScan(task.scan);
    this.rois = this.parseRois(task.rois);
    const layerUserMapping = this.getLayerUserMapping(this.rois);
    this.annotationLayers = this.parseAnnotationLayers(
      task.annotationGroups,
      layerUserMapping,
    );
  }

  private getLayerUserMapping(rois: DVRois[]): Map<string, string> {
    var layerUserMapping = new Map<string, string>();
    rois.forEach((roi) => {
      layerUserMapping.set(roi.layer, roi.user);
    });

    return layerUserMapping;
  }

  private parseAnnotationLayers(
    annotationGroups: any,
    layerUserMapping: Map<string, string>,
  ): DVAnnotationLayer[] {
    return annotationGroups.map(
      (annotationGroup: any) =>
        new DVAnnotationLayer(annotationGroup, layerUserMapping),
    );
  }

  public getLayerRoisList(): DVLayerRoisEntry[] {
    const list = [] as DVLayerRoisEntry[];
    this.rois.forEach((roi) => {
      const layerRois = this.getLayerRoisEntry(roi, list);
      layerRois.rois.push(roi.points);
    });
    return list;
  }

  private getLayerRoisEntry(rois: DVRois, list: DVLayerRoisEntry[]) {
    var layerRois = list.find(
      (m) => m.layerID === rois.layer && m.z === rois.z,
    );
    if (!layerRois) {
      layerRois = new DVLayerRoisEntry(rois);
      list.push(layerRois);
    }
    return layerRois;
  }

  private parseRois(rois: any): DVRois[] {
    return rois.map((roi: any) => new DVRois(roi));
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

import {
  DVAnnotationLayer,
  DVAnnotationTask,
  DVAnnotationTaskSnapshot,
  ViewType,
  createFileFromBase64,
  drawContours,
  fillContours,
  findContours,
  getPlaneAxes,
  putDVTask,
} from "@visian/utils";
import { AxiosResponse } from "axios";

import { ReviewTask, TaskType } from "./review-task";
import { ImageLayer, Document } from "../editor";
import { AnnotationGroup } from "../editor/annotation-groups";
import { IAnnotationGroup, IImageLayer } from "@visian/ui-shared";

export interface DVReviewTaskSnapshot {
  dvAnnotationTaskSnap: DVAnnotationTaskSnapshot;
}

export class DVReviewTask extends ReviewTask {
  public static fromSnapshot(snapshot: DVReviewTaskSnapshot) {
    return new DVReviewTask(
      new DVAnnotationTask(snapshot.dvAnnotationTaskSnap),
    );
  }

  private dvTask: DVAnnotationTask;

  public get id(): string {
    console.log("Get ID");
    return this.dvTask.taskID;
  }

  public get kind(): TaskType {
    return TaskType.Create;
  }

  public get title(): string {
    console.log("Get Title");
    return "Case ID: " + this.dvTask.case.caseID;
  }

  public get description(): string {
    console.log("Get Description");
    //TODO: Is there a proper description?
    return "DV Task Description Placeholder";
  }

  public get annotationIds(): string[] {
    console.log("Get Annotation IDs");
    return this.dvTask.annotationLayers.map((group) => group.annotationID);
  }

  constructor(dvTask: DVAnnotationTask) {
    super();
    this.dvTask = dvTask;
  }

  public async getImageFiles() {
    console.log("Get Image Files");

    return [createFileFromBase64("DVimage", this.dvTask.scan.data)];
  }

  public async getAnnotationFiles(annotationId: string) {
    return [];
  }

  public addGroupsAndLayers(document: Document) {
    //TODO: remove default group

    const map = this.getDvVisianLayerMapping(document);
    const roisList = this.dvTask.getLayerRoisList();

    for (const rois of roisList) {
      const visianLayerId = map.get(rois.layerID);
      if (!visianLayerId) throw new Error("No visian layer");
      const layer = document.getLayer(visianLayerId) as IImageLayer;
      if (!layer || !layer.isAnnotation) throw new Error("No layer");
      this.drawROIS(rois.rois, layer, rois.z);
    }
  }

  private getDvVisianLayerMapping(document: Document): Map<string, string> {
    var map = new Map<string, string>();
    for (const dvLayer of this.dvTask.annotationLayers) {
      const visianLayer = this.addLayerFromAnnotation(dvLayer, document);
      map.set(dvLayer.annotationID, visianLayer.id);
    }
    return map;
  }

  private drawROIS(rois: number[][], layer: IImageLayer, z: number) {
    const [widthAxis, heightAxis] = getPlaneAxes(ViewType.Transverse);
    const width = layer.image.voxelCount[widthAxis];
    const height = layer.image.voxelCount[heightAxis];

    const intRois = [];
    for (let i = 0; i < rois.length; i++) {
      const roi = rois[i];
      const intRoi = new Int32Array(roi.length);
      for (let j = 0; j < roi.length; j++) {
        intRoi[j] = Math.round(roi[j]);
      }
      intRois.push(intRoi);
    }

    // eslint-disable-next-line no-console
    console.log("roi coordinates as loaded from file", intRois);
    const data = drawContours(intRois, width, height);
    layer.setSlice(ViewType.Transverse, z, data);
    layer.recomputeSliceMarkers();
  }

  private addNewGroup(title: string, document: Document): IAnnotationGroup {
    const newGroup = new AnnotationGroup({ title }, document);
    document.addAnnotationGroup(newGroup);
    return newGroup;
  }

  private addLayerFromAnnotation(
    dvLayer: DVAnnotationLayer,
    document: Document,
  ): ImageLayer {
    if (!document.mainImageLayer) throw new Error("No main image layer");

    //TODO: add correct color
    const layer = ImageLayer.fromNewAnnotationForImage(
      document.mainImageLayer.image,
      document,
      document.getFirstUnusedColor(),
    );
    layer.setTitle(dvLayer.label);

    document.addLayer(layer);
    const group = this.getGroupFromLayer(dvLayer, document);
    group.addLayer(layer.id);

    return layer;
  }

  private getGroupFromLayer(
    dvLayer: DVAnnotationLayer,
    document: Document,
  ): IAnnotationGroup {
    const groupTitle = dvLayer.userID;
    var group = document.annotationGroups.find(
      (group: IAnnotationGroup) => group.title === groupTitle,
    );
    if (!group) {
      group = this.addNewGroup(groupTitle, document);
    }
    return group;
  }

  public async createAnnotation(files: File[]) {
    console.log("Create Annotation");
    return "newAnnotationId Placeholder";
  }

  public async updateAnnotation(
    annotationId: string,
    files: File[],
  ): Promise<void> {
    console.log("Update Annotation");
  }

  public async save(): Promise<AxiosResponse> {
    console.log("Save");
    return putDVTask(this.id, JSON.stringify(this.dvTask.toJSON()));
  }

  public toJSON(): DVReviewTaskSnapshot {
    return {
      dvAnnotationTaskSnap: this.dvTask.toJSON(),
    };
  }
}

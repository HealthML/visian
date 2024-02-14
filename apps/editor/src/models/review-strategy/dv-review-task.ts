import {
  dataColorKeys,
  dataColorToHex,
  IAnnotationGroup,
  IImageLayer,
  ILayer,
} from "@visian/ui-shared";
import {
  createFileFromBase64,
  drawContours,
  DVAnnotationLayer,
  DVAnnotationTask,
  DVAnnotationTaskSnapshot,
  DVRois,
  DVRoisOfASlice,
  fillContours,
  findContours,
  getPlaneAxes,
  putDvAnnotationTask,
  ViewType,
} from "@visian/utils";
import { AxiosResponse } from "axios";

import { Document, ImageLayer } from "../editor";
import { AnnotationGroup } from "../editor/annotation-groups";
import { ReviewTask, TaskType } from "./review-task";

export interface DVReviewTaskSnapshot {
  dvAnnotationTaskSnap: DVAnnotationTaskSnapshot;
}

export class DVReviewTask extends ReviewTask {
  public static fromSnapshot(snapshot: DVReviewTaskSnapshot) {
    return new DVReviewTask(
      DVAnnotationTask.createFromImport(snapshot.dvAnnotationTaskSnap),
    );
  }

  private dvAnnotationTask: DVAnnotationTask;

  public get id(): string {
    return this.dvAnnotationTask.taskID;
  }

  public get kind(): TaskType {
    return TaskType.Create;
  }

  public get title(): string {
    return `Case ID: ${this.dvAnnotationTask.dvCase.caseID}`;
  }

  public get description(): string {
    return "DV Task Description Placeholder";
  }

  public get annotationIds(): string[] {
    return this.dvAnnotationTask.annotationLayers.map(
      (group) => group.annotationID,
    );
  }

  constructor(dvAnnotationTask: DVAnnotationTask) {
    super();
    this.dvAnnotationTask = dvAnnotationTask;
  }

  public async getImageFiles() {
    return [createFileFromBase64("DVimage", this.dvAnnotationTask.scan.data)];
  }

  public async getAnnotationFiles(_annotationId: string) {
    throw new Error("Method not implemented.");
    return [];
  }

  public addGroupsAndLayers(document: Document) {
    this.removeGroupsCreatedByDefault(document);
    this.addDvLayersToVisian(document);
    const layerList = this.dvAnnotationTask.getLayerRoisList();
    layerList.forEach((e) => this.drawLayer(document, e));
  }

  private removeGroupsCreatedByDefault(doc: Document) {
    doc.annotationGroups.forEach((g) =>
      doc.removeAnnotationGroup(g as AnnotationGroup),
    );
  }

  private drawLayer(document: Document, rois: DVRoisOfASlice) {
    const visianLayerId = this.getVisianLayerId(rois.layerID);
    if (!visianLayerId) throw new Error("No visian layer");
    const imageLayer = document.getLayer(visianLayerId) as IImageLayer;
    if (!imageLayer || !imageLayer.isAnnotation) throw new Error("No layer");
    this.drawROIS(rois.rois, imageLayer, rois.z);
    this.fillROI(imageLayer, rois.z);
    imageLayer.recomputeSliceMarkers(ViewType.Transverse);
  }

  private getVisianLayerId(dvLayerId: string): string {
    if (!this.dvAnnotationTask.annotationLayers) throw new Error("No layers");

    const dvLayer = this.dvAnnotationTask.annotationLayers.find(
      (layer) => layer.annotationID === dvLayerId,
    );

    if (!dvLayer)
      throw new Error(`No layer found with dvLayerId: ${dvLayerId}`);
    if (!dvLayer.visianLayerID) throw new Error("No visian layer ID was set!");
    return dvLayer.visianLayerID;
  }

  private getDvLayer(visianLayerId: string): DVAnnotationLayer | undefined {
    const dvLayer = this.dvAnnotationTask.annotationLayers.find(
      (layer) => layer.visianLayerID === visianLayerId,
    );
    return dvLayer;
  }

  private addDvLayersToVisian(document: Document) {
    this.dvAnnotationTask.annotationLayers.forEach((dvLayer) => {
      const visianLayer = this.addLayerFromAnnotation(dvLayer, document);
      dvLayer.visianLayerID = visianLayer.id;
    });
  }

  private drawROIS(rois: number[][], layer: IImageLayer, z: number) {
    const [width, height] = this.getWidthAndHeight(layer);

    const intRois = [];
    for (let i = 0; i < rois.length; i++) {
      const roi = rois[i];
      const intRoi = new Int32Array(roi.length);
      for (let j = 0; j < roi.length; j++) {
        intRoi[j] = Math.round(roi[j]);
      }
      intRois.push(intRoi);
    }

    const data = drawContours(intRois, width, height);
    layer.setSlice(ViewType.Transverse, z, data);
  }

  private fillROI(layer: IImageLayer, z: number) {
    const [width, height] = this.getWidthAndHeight(layer);

    let data = layer.getSlice(ViewType.Transverse, z) as Uint8Array;
    data = fillContours(data, width, height);
    layer.setSlice(ViewType.Transverse, z, data);
  }

  private getWidthAndHeight(layer: IImageLayer): [number, number] {
    const [widthAxis, heightAxis] = getPlaneAxes(ViewType.Transverse);
    const width = layer.image.voxelCount[widthAxis];
    const height = layer.image.voxelCount[heightAxis];
    return [width, height];
  }

  private addGroup(title: string, document: Document): IAnnotationGroup {
    const group = new AnnotationGroup({ title }, document);
    document.addAnnotationGroup(group);
    return group;
  }

  private addLayerFromAnnotation(
    dvLayer: DVAnnotationLayer,
    document: Document,
  ): ImageLayer {
    if (!document.mainImageLayer) throw new Error("No main image layer");

    const layer = ImageLayer.fromNewAnnotationForImage(
      document.mainImageLayer.image,
      document,
      dvLayer.color,
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
    let group = document.annotationGroups.find(
      (g: IAnnotationGroup) => g.title === groupTitle,
    );
    if (!group) {
      group = this.addGroup(groupTitle, document);
    }
    return group;
  }

  public async createAnnotation(_files: File[]) {
    return "newAnnotationId Placeholder";
  }

  public async updateAnnotation(
    _annotationId: string,
    _files: File[],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}

  public async save(document: Document): Promise<AxiosResponse> {
    this.updateDvTask(document);
    putDvAnnotationTask(this.id, this.dvAnnotationTask);
    return Promise.resolve({} as AxiosResponse);
  }

  private updateDvTask(document: Document) {
    this.resetRoisOfDvTask();
    document.layers.forEach((layer) => {
      if (layer.isAnnotation) {
        this.updateDvTaskLayer(layer);
        this.addRoisToDvTask(layer as IImageLayer);
      }
    });
  }

  private resetRoisOfDvTask() {
    this.dvAnnotationTask.rois = [];
  }

  private updateDvTaskLayer(layer: ILayer) {
    const dvLayer = this.getDvLayer(layer.id);
    if (!dvLayer) {
      this.addLayerToDvTask(layer);
    } else {
      this.updateDvLayer(layer, dvLayer);
    }
  }

  private addLayerToDvTask(layer: ILayer) {
    const dvLayer = new DVAnnotationLayer(
      this.dvAnnotationTask.getNextAnnotationLayerID(),
      this.dvAnnotationTask.userID,
      layer.title || "Untitled",
      this.colorToHex(layer.color),
      layer.id,
    );
    this.dvAnnotationTask.annotationLayers.push(dvLayer);
  }

  private updateDvLayer(layer: ILayer, dvLayer: DVAnnotationLayer) {
    dvLayer.color = this.colorToHex(layer.color);
    if (layer.title) dvLayer.label = layer.title;
  }

  private colorToHex(color: string | undefined): string {
    if (!color) return "#000000";
    if (color.startsWith("#")) return color;
    if (dataColorKeys.includes(color as any))
      return dataColorToHex(color as any);
    return "#000000";
  }

  private addRoisToDvTask(layer: IImageLayer) {
    const dvLayer = this.getDvLayer(layer.id);
    if (!dvLayer) throw new Error("No corresponding dvLayer found!");
    const slices = this.getSlicesWithRois(layer);

    slices.forEach((slice) => {
      slice.rois.forEach((roi) => {
        this.dvAnnotationTask.rois.push(
          new DVRois(
            slice.z,
            dvLayer.userID,
            this.dvAnnotationTask.scan.scanID,
            dvLayer.annotationID,
            roi,
          ),
        );
      });
    });
  }

  private getSlicesWithRois(layer: IImageLayer): DVRoisOfASlice[] {
    const slicesWithRois = [];
    for (let z = 0; z < layer.image.voxelCount["z"]; z++) {
      const contours = this.getROIcontours(layer, z);
      if (contours.length !== 0) {
        const rois = this.convertInt32ArrayToNumberArray(contours);
        slicesWithRois.push(new DVRoisOfASlice(layer.id, z, rois));
      }
    }

    return slicesWithRois;
  }

  private convertInt32ArrayToNumberArray(array: Int32Array[]): number[][] {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      result.push(Array.from(array[i]));
    }
    return result;
  }

  private getROIcontours(layer: IImageLayer, z: number): Int32Array[] {
    const [width, height] = this.getWidthAndHeight(layer);

    const data = layer.getSlice(ViewType.Transverse, z) as Uint8Array;
    return findContours(data, width, height);
  }

  public toJSON(): DVReviewTaskSnapshot {
    return {
      dvAnnotationTaskSnap: this.dvAnnotationTask.toJSON(),
    };
  }
}

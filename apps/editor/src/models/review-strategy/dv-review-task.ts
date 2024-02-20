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
  DVRoi,
  DVSlice,
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
    return this.dvAnnotationTask.annotationLayers.map((layer) => layer.id);
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
    this.removeDefaultAnnotationGroups(document);
    this.addDvLayersToVisian(document);
    const slices = this.dvAnnotationTask.addRoisToCorrespondingSlices();
    slices.forEach((slice) => this.drawSliceContours(document, slice));
  }

  private removeDefaultAnnotationGroups(doc: Document) {
    doc.annotationGroups.forEach((g) =>
      doc.removeAnnotationGroup(g as AnnotationGroup),
    );
  }

  private addDvLayersToVisian(document: Document) {
    this.dvAnnotationTask.annotationLayers.forEach((dvLayer) => {
      const visianLayer = this.addLayerToVisian(dvLayer, document);
      dvLayer.visianLayerID = visianLayer.id;
    });
  }

  private addLayerToVisian(
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
    const group = this.addDVLayerToAnnotationGroup(dvLayer, document);
    group.addLayer(layer.id);

    return layer;
  }

  private addDVLayerToAnnotationGroup(
    dvLayer: DVAnnotationLayer,
    document: Document,
  ): IAnnotationGroup {
    const groupTitle = `User ${dvLayer.userID}`;
    let group = document.annotationGroups.find(
      (g: IAnnotationGroup) => g.title === groupTitle,
    );
    if (!group) {
      group = new AnnotationGroup({ title: groupTitle }, document);
      document.addAnnotationGroup(group as AnnotationGroup);
    }
    return group;
  }

  private drawSliceContours(document: Document, slice: DVSlice) {
    const visianLayerId = this.getVisianLayerId(slice.layerID);
    if (!visianLayerId) throw new Error("No visian layer");

    const imageLayer = document.getLayer(visianLayerId) as IImageLayer;
    if (!imageLayer || !imageLayer.isAnnotation) throw new Error("No layer");

    this.drawAndFillContours(slice.getContours(), imageLayer, slice.z);
    imageLayer.recomputeSliceMarkers(ViewType.Transverse);
  }

  private getVisianLayerId(dvLayerId: string): string {
    const dvLayer = this.dvAnnotationTask.annotationLayers.find(
      (layer) => layer.id === dvLayerId,
    );

    if (!dvLayer)
      throw new Error(`No layer found with dvLayerId: ${dvLayerId}`);
    if (!dvLayer.visianLayerID) throw new Error("No visian layer ID was set!");
    return dvLayer.visianLayerID;
  }

  private drawAndFillContours(
    contours: number[][],
    layer: IImageLayer,
    z: number,
  ) {
    const [width, height] = this.getWidthAndHeight(layer);

    const mirroredContours = this.mirrorAndRoundContours(
      contours,
      width,
      height,
    );
    const intContours = mirroredContours.map(
      (points) => new Int32Array(points),
    );

    let data = drawContours(intContours, width, height);
    data = fillContours(data, width, height);
    layer.setSlice(ViewType.Transverse, z, data);
  }

  private getDvLayerFromVisianLayer(
    visianLayerId: string,
  ): DVAnnotationLayer | undefined {
    return this.dvAnnotationTask.annotationLayers.find(
      (layer) => layer.visianLayerID === visianLayerId,
    );
  }

  private getWidthAndHeight(layer: IImageLayer): [number, number] {
    const [widthAxis, heightAxis] = getPlaneAxes(ViewType.Transverse);
    const width = layer.image.voxelCount[widthAxis];
    const height = layer.image.voxelCount[heightAxis];
    return [width, height];
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
    this.dvAnnotationTask.rois = [];
    document.layers.forEach((layer) => {
      if (layer.isAnnotation) {
        this.updateDvLayer(layer);
        this.addRoisToDvTask(layer as IImageLayer);
      }
    });
  }

  private updateDvLayer(layer: ILayer) {
    const dvLayer = this.getDvLayerFromVisianLayer(layer.id);
    if (!dvLayer) {
      this.addLayerToDvTask(layer);
    } else {
      dvLayer.color = this.colorToHex(layer.color);
      if (layer.title) dvLayer.label = layer.title;
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

  private colorToHex(color: string | undefined): string {
    if (!color) return "#000000";
    if (color.startsWith("#")) return color;
    if (dataColorKeys.includes(color as any))
      return dataColorToHex(color as any);
    return "#000000";
  }

  private addRoisToDvTask(layer: IImageLayer) {
    const dvLayer = this.getDvLayerFromVisianLayer(layer.id);
    if (!dvLayer) throw new Error("No corresponding dvLayer found!");
    const slices = this.getSlicesContainingAnnotations(layer);

    slices.forEach((slice) => {
      slice.getContours().forEach((points) => {
        this.dvAnnotationTask.rois.push(
          new DVRoi(
            dvLayer.id,
            slice.z,
            this.dvAnnotationTask.scan.scanID,
            dvLayer.userID,
            points,
          ),
        );
      });
    });
  }

  private getSlicesContainingAnnotations(layer: IImageLayer): DVSlice[] {
    const [width, height] = this.getWidthAndHeight(layer);
    const slicesContainingRois = [];
    for (let z = 0; z < layer.image.voxelCount["z"]; z++) {
      const contours = this.getRoiContours(layer, z);
      if (contours.length >= 1) {
        const mirroredContours = this.mirrorAndRoundContours(
          contours,
          width,
          height,
        );
        slicesContainingRois.push(new DVSlice(layer.id, z, mirroredContours));
      }
    }

    return slicesContainingRois;
  }

  private getRoiContours(layer: IImageLayer, z: number): Int32Array[] {
    const [width, height] = this.getWidthAndHeight(layer);

    const data = layer.getSlice(ViewType.Transverse, z) as Uint8Array;
    return findContours(data, width, height);
  }

  /**
   * Mirrors and rounds the given contours to the nearest int based on the specified width and height.
   * This is necessary, because the origin of the image in DV is in the top left corner,
   * while in Visian it is in the bottom right corner.
   * @param contours - The contours to be mirrored and rounded.
   * @param width - The width of the image.
   * @param height - The height of the image.
   * @returns The mirrored and rounded contours.
   */
  private mirrorAndRoundContours(
    contours: number[][] | Int32Array[],
    width: number,
    height: number,
  ): number[][] {
    const mirroredContours = [];
    for (let i = 0; i < contours.length; i++) {
      const points = contours[i];
      const mirroredPoints = [];
      for (let j = 0; j < points.length; j += 2) {
        mirroredPoints.push(width - Math.round(points[j]));
        mirroredPoints.push(height - Math.round(points[j + 1]));
      }
      mirroredContours.push(mirroredPoints);
    }
    return mirroredContours;
  }

  public toJSON(): DVReviewTaskSnapshot {
    return {
      dvAnnotationTaskSnap: this.dvAnnotationTask.toJSON(),
    };
  }
}

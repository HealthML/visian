import {
  DVAnnotationLayer,
  DVAnnotationTask,
  DVAnnotationTaskSnapshot,
  createFileFromBase64,
  putDVTask,
} from "@visian/utils";
import { AxiosResponse } from "axios";

import { ReviewTask, TaskType } from "./review-task";
import { ImageLayer, Document } from "../editor";
import { AnnotationGroup } from "../editor/annotation-groups";
import { IAnnotationGroup } from "@visian/ui-shared";

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

  public addGroup() {}

  public async getAnnotationFiles(annotationId: string) {
    return [];
  }

  public addGroupsAndLayers(document: Document) {
    //TODO: remove default group

    // const defaultGroup = document.annotationGroups[0];
    // if (!defaultGroup) throw new Error("No default group");

    for (const layer of this.dvTask.annotationLayers) {
      this.addLayerFromAnnotation(layer, document);
    }
  }

  private addNewGroup(title: string, document: Document): IAnnotationGroup {
    const newGroup = new AnnotationGroup({ title }, document);
    document.addAnnotationGroup(newGroup);
    return newGroup;
  }

  private addLayerFromAnnotation(
    dvLayer: DVAnnotationLayer,
    document: Document,
  ) {
    if (!document.mainImageLayer) throw new Error("No main image layer");

    const layer = ImageLayer.fromNewAnnotationForImage(
      document.mainImageLayer.image,
      document,
      document.getFirstUnusedColor(),
    );
    layer.setTitle(dvLayer.label);

    document.addLayer(layer);
    const group = this.getGroupFromLayer(dvLayer, document);
    group.addLayer(layer.id);
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

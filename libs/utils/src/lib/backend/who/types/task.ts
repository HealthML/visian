import {
  WHOAnnotation,
  WHOAnnotationSnapshot,
  WHOAnnotationStatus,
} from "./annotation";
import { WHOAnnotationTask, WHOAnnotationTaskSnapshot } from "./annotationTask";
import { WHOSample } from "./sample";
import { WHOUser, WHOUserSnapshot } from "./user";

export interface WHOTaskSnapshot {
  taskUUID: string;
  kind: string;
  readOnly: boolean;
  annotationTasks: WHOAnnotationTaskSnapshot[];
  annotations?: WHOAnnotationSnapshot[];
  assignee: WHOUserSnapshot;
}

export enum WHOTaskType {
  Create = "create",
  Correct = "correct",
  Review = "review",
}

export class WHOTask {
  public taskUUID: string;
  public kind: WHOTaskType;
  public readOnly: boolean;
  public annotationTasks: WHOAnnotationTask[];
  public samples: WHOSample[];
  public annotations: WHOAnnotation[];
  public assignee: WHOUser;

  // TODO: Properly type API response data
  constructor(task: any) {
    this.taskUUID = task.taskUUID;
    this.kind = task.kind;
    this.readOnly = task.readOnly;
    this.annotationTasks = task.annotationTasks.map(
      (annotationTask: any) => new WHOAnnotationTask(annotationTask),
    );
    this.samples = task.samples.map((sample: any) => new WHOSample(sample));
    this.annotations = task.annotations.map(
      (annotation: any) => new WHOAnnotation(annotation),
    );
    this.assignee = new WHOUser(task.assignee);
  }

  public addNewAnnotation(): void {
    const annotationData = {
      status: WHOAnnotationStatus.Pending,
      data: [],
      annotator: this.assignee,
      submittedAt: "",
    };
    const annotation = new WHOAnnotation(annotationData);
    this.annotations.push(annotation);
  }

  public toJSON(): WHOTaskSnapshot {
    return {
      taskUUID: this.taskUUID,
      kind: this.kind,
      readOnly: this.readOnly,
      annotationTasks: Object.values(this.annotationTasks).map(
        (annotationTask) => annotationTask.toJSON(),
      ),
      annotations: Object.values(this.annotations).map((annotation) =>
        annotation.toJSON(),
      ),
      assignee: this.assignee.toJSON(),
    };
  }
}

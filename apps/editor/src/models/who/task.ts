import { Annotation, AnnotationSnapshot } from "./annotation";
import { AnnotationTask, AnnotationTaskSnapshot } from "./annotationTask";
import { Sample, SampleSnapshot } from "./sample";

export interface TaskSnapshot {
  taskUUID: string;
  kind: string;
  readOnly: boolean;
  annotationTasks: AnnotationTaskSnapshot[];
  samples: SampleSnapshot[];
  annotations?: AnnotationSnapshot[];
}

export enum TaskType {
  Create = "create",
  Correct = "correct",
  Review = "review",
}

export class Task {
  public taskUUID: string;
  public kind: TaskType;
  public readOnly: boolean;
  public annotationTasks: AnnotationTask[];
  public samples: Sample[];
  public annotations?: Annotation[];

  constructor(task: any) {
    this.taskUUID = task.taskUUID;
    this.kind = task.kind;
    this.readOnly = task.readOnly;
    this.annotationTasks = JSON.parse(task.annotationTasks).array.map(
      (annotationTask: any) => new AnnotationTask(annotationTask),
    );
    this.samples = JSON.parse(task.samples).array.map(
      (sample: any) => new Sample(sample),
    );
    this.annotations = JSON.parse(task.annotations).array.map(
      (annotation: any) => new Annotation(annotation),
    );
  }

  public toJSON(): TaskSnapshot {
    return {
      taskUUID: this.taskUUID,
      kind: this.kind,
      readOnly: this.readOnly,
      annotationTasks: Object.values(
        this.annotationTasks,
      ).map((annotationTask) => annotationTask.toJSON()),
      samples: Object.values(this.samples).map((sample) => sample.toJSON()),
      annotations: this.annotations
        ? Object.values(this.annotations).map((annotation) =>
            annotation.toJSON(),
          )
        : [],
    };
  }
}

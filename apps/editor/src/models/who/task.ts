import { Annotation, AnnotationSnapshot, AnnotationStatus } from "./annotation";
import { AnnotationTask, AnnotationTaskSnapshot } from "./annotationTask";
import { Sample } from "./sample";
import { User, UserSnapshot } from "./user";

export interface TaskSnapshot {
  taskUUID: string;
  kind: string;
  readOnly: boolean;
  annotationTasks: AnnotationTaskSnapshot[];
  annotations?: AnnotationSnapshot[];
  assignee: UserSnapshot;
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
  public annotations: Annotation[];
  public assignee: User;

  // TODO: Properly type API response data
  constructor(task: any) {
    this.taskUUID = task.taskUUID;
    this.kind = task.kind;
    this.readOnly = task.readOnly;
    this.annotationTasks = task.annotationTasks.map(
      (annotationTask: any) => new AnnotationTask(annotationTask),
    );
    this.samples = task.samples.map((sample: any) => new Sample(sample));
    this.annotations = task.annotations.map(
      (annotation: any) => new Annotation(annotation),
    );
    this.assignee = new User(task.assignee);
  }

  public addNewAnnotation(): void {
    const annotationData = {
      status: AnnotationStatus.Pending,
      data: [],
      annotator: this.assignee,
      submittedAt: "",
    };
    const annotation = new Annotation(annotationData);
    this.annotations.push(annotation);
  }

  public toJSON(): TaskSnapshot {
    return {
      taskUUID: this.taskUUID,
      kind: this.kind,
      readOnly: this.readOnly,
      annotationTasks: Object.values(
        this.annotationTasks,
      ).map((annotationTask) => annotationTask.toJSON()),
      annotations: Object.values(this.annotations).map((annotation) =>
        annotation.toJSON(),
      ),
      assignee: this.assignee.toJSON(),
    };
  }
}

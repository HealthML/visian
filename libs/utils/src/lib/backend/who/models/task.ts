import {
  AnnotationSnapshotWHO,
  AnnotationStatus,
  AnnotationWHO,
} from "./annotation";
import { AnnotationTaskSnapshotWHO, AnnotationTaskWHO } from "./annotationTask";
import { SampleWHO } from "./sample";
import { UserSnapshotWHO, UserWHO } from "./user";

export interface TaskSnapshotWHO {
  taskUUID: string;
  kind: string;
  readOnly: boolean;
  annotationTasks: AnnotationTaskSnapshotWHO[];
  annotations?: AnnotationSnapshotWHO[];
  assignee: UserSnapshotWHO;
}

export enum TaskTypeWHO {
  Create = "create",
  Correct = "correct",
  Review = "review",
}

export class TaskWHO {
  public taskUUID: string;
  public kind: TaskTypeWHO;
  public readOnly: boolean;
  public annotationTasks: AnnotationTaskWHO[];
  public samples: SampleWHO[];
  public annotations: AnnotationWHO[];
  public assignee: UserWHO;

  // TODO: Properly type API response data
  constructor(task: any) {
    this.taskUUID = task.taskUUID;
    this.kind = task.kind;
    this.readOnly = task.readOnly;
    this.annotationTasks = task.annotationTasks.map(
      (annotationTask: any) => new AnnotationTaskWHO(annotationTask),
    );
    this.samples = task.samples.map((sample: any) => new SampleWHO(sample));
    this.annotations = task.annotations.map(
      (annotation: any) => new AnnotationWHO(annotation),
    );
    this.assignee = new UserWHO(task.assignee);
  }

  public addNewAnnotation(): void {
    const annotationData = {
      status: AnnotationStatus.Pending,
      data: [],
      annotator: this.assignee,
      submittedAt: "",
    };
    const annotation = new AnnotationWHO(annotationData);
    this.annotations.push(annotation);
  }

  public toJSON(): TaskSnapshotWHO {
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

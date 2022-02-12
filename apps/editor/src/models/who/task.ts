import {
  AnnotationStatus,
  ITask,
  TaskSnapshot,
  TaskType,
} from "@visian/ui-shared";
import { Annotation } from "./annotation";
import { AnnotationTask } from "./annotationTask";
import { Campaign } from "./campaign";
import { Sample } from "./sample";
import { User } from "./user";

export class Task implements ITask {
  public taskUUID: string;
  public kind: TaskType;
  public readOnly: boolean;
  public annotationTasks: AnnotationTask[];
  public samples: Sample[];
  public annotations: Annotation[];
  public assignee: User;
  public campaign?: Campaign;

  // TODO: Properly type API response data
  // TODO: Make observable
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
    if (task.campaign && Object.keys(task.campaign).length > 1) {
      this.campaign = new Campaign(task.campaign);
    }
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
      campaign: this.campaign ? this.campaign.toJSON() : {},
    };
  }
}

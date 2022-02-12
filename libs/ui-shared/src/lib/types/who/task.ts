import { AnnotationSnapshot, IAnnotation } from "./annotation";
import { AnnotationTaskSnapshot, IAnnotationTask } from "./annotationTask";
import { CampaignSnapshot, ICampaign } from "./campaign";
import { ISample } from "./sample";
import { IUser, UserSnapshot } from "./user";

export interface TaskSnapshot {
  taskUUID: string;
  kind: string;
  readOnly: boolean;
  annotationTasks: AnnotationTaskSnapshot[];
  annotations?: AnnotationSnapshot[];
  assignee: UserSnapshot;
  campaign: CampaignSnapshot | Record<string, never>;
}

export enum TaskType {
  Create = "create",
  Correct = "correct",
  Review = "review",
}

export interface ITask {
  taskUUID: string;
  kind: TaskType;
  readOnly: boolean;
  annotationTasks: IAnnotationTask[];
  samples: ISample[];
  annotations: IAnnotation[];
  assignee: IUser;
  campaign?: ICampaign;

  addNewAnnotation(): void;
  toJSON(): TaskSnapshot;
}

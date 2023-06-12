export enum TaskType {
  Create = "create",
  Review = "review",
  Supervise = "supervise",
}
export interface ReviewTask {
  kind: TaskType;
  title: String;
  description: String;
  imageFiles():File[];
  annotationFiles():File[];
}

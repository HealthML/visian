export class TaskAnnotation {
  public data: string;
  public updatedAt: Date;

  constructor(data: string) {
    this.data = data;
    this.updatedAt = new Date();
  }
}

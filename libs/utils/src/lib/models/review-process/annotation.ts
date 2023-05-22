export class TaskAnnotation {
  public id: string;
  public layerId?: string;
  public updatedAt: Date;

  constructor(id: string) {
    this.id = id;
    this.updatedAt = new Date();
  }
}

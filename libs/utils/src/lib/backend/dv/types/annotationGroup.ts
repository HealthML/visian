export interface DVAnnotationGroupSnapshot {
  id: string;
  label: string;
  color: string;
}

export class DVAnnotationGroup {
  public annotationID: string;
  public label: string;
  public color: string;

  constructor(annotation: any) {
    this.annotationID = annotation.id;
    this.label = annotation.label;
    this.color = annotation.color;
  }

  public toJSON(): DVAnnotationGroupSnapshot {
    return {
      id: this.annotationID,
      label: this.label,
      color: this.color,
    };
  }
}

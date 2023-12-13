export interface DVAnnotationSnapshot {
  annotationUUID: string;
  label: string;
  color: string;
}

export class DVAnnotation {
  public annotationUUID: string;
  public label: string;
  public color: string;

  // TODO: Properly type API response data
  constructor(annotation: any) {
    this.annotationUUID = annotation.annotationUUID;
    this.label = annotation.label;
    this.color = annotation.color;
  }

  public toJSON(): DVAnnotationSnapshot {
    return {
      annotationUUID: this.annotationUUID,
      label: this.label,
      color: this.color,
    };
  }
}

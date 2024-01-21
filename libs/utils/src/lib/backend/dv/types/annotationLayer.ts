export interface DVAnnotationGroupSnapshot {
  id: string;
  label: string;
  color: string;
}

export class DVAnnotationLayer {
  public annotationID: string;
  public userID: string;
  public label: string;
  public color: string;

  constructor(annotation: any, layerUserMapping: Map<string, string>) {
    this.annotationID = annotation.id;
    this.label = annotation.label;
    this.color = annotation.color;
    this.userID = layerUserMapping.get(this.annotationID) ?? "unknown";
  }

  public toJSON(): DVAnnotationGroupSnapshot {
    return {
      id: this.annotationID,
      label: this.label,
      color: this.color,
    };
  }
}

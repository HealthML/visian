import { Annotation, Image } from "./dataset-types";

export interface FileWithMetadata extends File {
  metadata: Annotation | Image;
}

export interface FileWithFamily extends File {
  familyId: string;
  metadata?: Annotation | Image;
}

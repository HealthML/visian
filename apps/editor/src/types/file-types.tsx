import { Annotation, Image } from "./dataset-types";

export interface FileWithMetadata extends File {
  metadata: Annotation | Image;
}

export interface FileWithGroup extends File {
  groupId: string;
}

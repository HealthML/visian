/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FileMetadata {
  id: string;
  [key: string]: any;
}

export interface FileWithMetadata extends File {
  metadata: FileMetadata;
}

export interface FileWithGroup extends File {
  groupId: string;
  metadata: FileMetadata;
}

import { MiaJob } from "./jobs-history-types";

export interface MiaDataset {
  id: string;
  name: string;
  project: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiaImage {
  id: string;
  dataUri: string;
  dataset: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiaAnnotation {
  id: string;
  dataUri: string;
  verified: boolean;
  image: string;
  job: MiaJob;
  createdAt: string;
  updatedAt: string;
}

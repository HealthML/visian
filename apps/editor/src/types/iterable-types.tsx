import { Dataset } from "./dataset-types";
import { Project } from "./project-types";

export interface IterableData extends Dataset, Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

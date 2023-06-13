export interface MlModel {
  name: string;
  version: string;
  description: string;
  tags: { key: string; value: string }[];
  createdAt: string;
  updatedAt: string;
}

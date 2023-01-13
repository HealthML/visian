export type Dataset = {
  id: string;
  name: string;
  project: string;
  createdAt: string;
  updatedAt: string;
};

export type Image = {
  id: string;
  dataUri: string;
  dataset: string;
  createdAt: string;
  updatedAt: string;
};

export type Annotation = {
  id: string;
  dataUri: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

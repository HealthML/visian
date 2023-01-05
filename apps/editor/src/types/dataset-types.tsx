export type Dataset = {
  id: string;
  name: string;
  images: Image[];
};

export type Image = {
  id: string;
  dataUri: string;
  annotations: Annotation[];
};

export type Annotation = {
  id: string;
  dataUri: string;
};

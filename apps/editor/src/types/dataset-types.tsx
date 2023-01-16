export interface Dataset {
  id: string;
  name: string;
  project: string;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  dataUri: string;
  dataset: string;
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  id: string;
  dataUri: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

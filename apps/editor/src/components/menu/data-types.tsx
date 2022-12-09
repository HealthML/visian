export type DocumentProp = {
  isSelected: boolean;
};

export type DatasetProps = {
  [id: string]: DocumentProp;
};

export type DocumentItem = {
  id: string;
  name: string;
  annoations: Annotation[];
};

export type Dataset = DocumentItem[];

export type Annotation = {
  id: string;
  name: string;
};

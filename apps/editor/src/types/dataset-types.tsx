export type DocumentProp = {
  isSelected: boolean;
};

export type DocumentItem = {
  id: string;
  name: string;
  annotations: Annotation[];
  props: DocumentProp;
};

export type Dataset = DocumentItem[];

export type Annotation = {
  id: string;
  name: string;
};

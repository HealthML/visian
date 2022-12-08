export type DocumentProp = {
  isSelected: boolean;
};

export type DatasetProps = {
  [id: string]: DocumentProp;
};

export type DocumentItem = {
  id: string;
  name: string;
};

export type Dataset = DocumentItem[];

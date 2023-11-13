export interface ListNavigatorProps<T> {
  list?: T[];
  currentItem?: T;
  onChange?: (newIndex: number) => void;
}

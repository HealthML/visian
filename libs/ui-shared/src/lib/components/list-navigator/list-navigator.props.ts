export interface ListNavigatorProps<T> {
  list?: T[];
  currentItem?: T;
  hasChanges?: boolean;
  onClickHasChanges?: () => void;
  onSwitch?: (newIndex: number) => void;
}

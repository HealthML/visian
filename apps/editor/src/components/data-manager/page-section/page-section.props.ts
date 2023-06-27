export interface PageSectionProps {
  title?: string;
  titleTx?: string;
  info?: string;
  infoTx?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  showActions?: boolean;
  isLoading?: boolean;
}

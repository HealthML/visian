import { I18nData } from "./translation";

export enum Serverity {
  error = "error",
  warning = "warning",
  notification = "notification",
}
export interface ErrorNotification {
  serverity: Serverity;
  title?: string;
  titleTx?: string;
  description?: string;
  descriptionTx?: string;
  descriptionData?: I18nData;
}

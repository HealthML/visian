import { I18nData } from "./translation";

export interface ErrorNotification {
  title?: string;
  titleTx?: string;
  description?: string;
  descriptionTx?: string;
  descriptionData?: I18nData;
}

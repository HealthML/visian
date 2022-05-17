import { IUser, UserSnapshot } from "./user";

export interface CampaignSnapshot {
  campaignUUID: string;
  name: string;
  description: string;
  status: string;
  datasets: string[];
  annotators: UserSnapshot[];
  reviewers: UserSnapshot[];
}

export interface ICampaign {
  campaignUUID: string;
  name: string;
  description: string;
  status: string;
  datasets: string[];
  annotators: IUser[];
  reviewers: IUser[];

  toJSON(): CampaignSnapshot;
}

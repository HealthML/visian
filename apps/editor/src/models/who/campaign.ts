import { User, UserSnapshot } from "./user";

export interface CampaignSnapshot {
  campaignUUID: string;
  name: string;
  description: string;
  status: string;
  datasets: string[];
  annotators: UserSnapshot[];
  reviewers: UserSnapshot[];
}

export class Campaign {
  public campaignUUID: string;
  public name: string;
  public description: string;
  public status: string;
  public datasets: string[];
  public annotators: User[];
  public reviewers: User[];

  // TODO: Properly type API response data
  constructor(campaign: any) {
    this.campaignUUID = campaign.campaignUUID;
    this.name = campaign.name;
    this.description = campaign.description;
    this.status = campaign.status;
    this.datasets = campaign.datasets;
    this.annotators = campaign.annotators.map(
      (annotator: any) => new User(annotator),
    );
    this.reviewers = campaign.reviewers.map(
      (reviewer: any) => new User(reviewer),
    );
  }

  public toJSON(): CampaignSnapshot {
    return {
      campaignUUID: this.campaignUUID,
      name: this.name,
      description: this.description,
      status: this.status,
      datasets: this.datasets,
      annotators: Object.values(this.annotators).map((annotator) =>
        annotator.toJSON(),
      ),
      reviewers: Object.values(this.reviewers).map((reviewer) =>
        reviewer.toJSON(),
      ),
    };
  }
}

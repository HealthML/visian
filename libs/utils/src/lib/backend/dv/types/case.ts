export interface DVCaseSnapshot {
  caseID: number;
}

export class DVCase {
  public caseID: number;

  // TODO: Properly type API response data
  constructor(dvCase: any) {
    this.caseID = dvCase.caseID;
  }

  public toJSON(): DVCaseSnapshot {
    return {
      caseID: this.caseID,
    };
  }
}

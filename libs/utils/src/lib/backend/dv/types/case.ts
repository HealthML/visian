export interface DVCaseSnapshot {
  caseID: number;
}

export class DVCase {
  public caseID: number;

  constructor(dvCase: any) {
    this.caseID = dvCase.caseID;
  }

  public toJSON(): DVCaseSnapshot {
    return {
      caseID: this.caseID,
    };
  }
}

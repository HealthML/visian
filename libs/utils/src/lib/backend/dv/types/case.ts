export interface DVCaseSnapshot {
  caseID: number;
}

export class DVCase {
  constructor(public caseID: number) {}

  public toJSON(): DVCaseSnapshot {
    return {
      caseID: this.caseID,
    };
  }
}

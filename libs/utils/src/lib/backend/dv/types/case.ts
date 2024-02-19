export interface DVCaseSnapshot {
  caseID: number;
}

/**
 * Represents a DVCase.
 */
export class DVCase {
  constructor(public caseID: number) {
    this.caseID = caseID;
  }

  public toJSON(): DVCaseSnapshot {
    return {
      caseID: this.caseID,
    };
  }
}

import { AnnotatorSnapshot, IAnnotator } from "@visian/ui-shared";

export class Annotator implements IAnnotator {
  public annotatorUUID: string;
  public expertise: string;
  public yearsInPractice: number;
  public expectedSalary: number;
  public workCountry: string;
  public studyCountry: string;
  public selfAssessment: number;
  public degree: string;

  // TODO: Properly type API response data
  // TODO: Make observable
  constructor(annotator: any) {
    this.annotatorUUID = annotator.annotatorUUID;
    this.expertise = annotator.expertise;
    this.yearsInPractice = annotator.yearsInPractice;
    this.expectedSalary = annotator.expectedSalary;
    this.workCountry = annotator.workCountry;
    this.studyCountry = annotator.studyCountry;
    this.selfAssessment = annotator.selfAssessment;
    this.degree = annotator.degree;
  }

  public toJSON(): AnnotatorSnapshot {
    return {
      annotatorUUID: this.annotatorUUID,
      expertise: this.expertise,
      yearsInPractice: this.yearsInPractice,
      expectedSalary: this.expectedSalary,
      workCountry: this.workCountry,
      studyCountry: this.studyCountry,
      selfAssessment: this.selfAssessment,
      degree: this.degree,
    };
  }
}

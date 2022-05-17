export interface AnnotatorSnapshot {
  annotatorUUID: string;
  expertise: string;
  yearsInPractice: number;
  expectedSalary: number;
  workCountry: string;
  studyCountry: string;
  selfAssessment: number;
  degree: string;
}

export interface IAnnotator {
  annotatorUUID: string;
  expertise: string;
  yearsInPractice: number;
  expectedSalary: number;
  workCountry: string;
  studyCountry: string;
  selfAssessment: number;
  degree: string;

  toJSON(): AnnotatorSnapshot;
}

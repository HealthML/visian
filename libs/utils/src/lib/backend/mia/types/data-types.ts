import {
  Annotation,
  CreateDatasetDto,
  CreateJobDto,
  CreateProjectDto,
  Dataset,
  DeleteAllDto,
  Image,
  Job,
  JobStatusEnum,
  ModelVersion,
  ModelVersionTag,
  Progress,
  Project,
  UpdateDatasetDto,
  UpdateProjectDto,
} from "@visian/mia-api";

export type MiaAnnotation = Annotation;
export type MiaImage = Image;
export type MiaDataset = Dataset;
export type MiaProject = Project;
export type MiaJob = Job;
export type MiaJobStatusEnum = JobStatusEnum;
export type MiaProgress = Progress;
export type MiaModelVersion = ModelVersion;
export type MiaModelVersionTag = ModelVersionTag;
export type CreateMiaDatasetDto = CreateDatasetDto;
export type CreateMiaJobDto = CreateJobDto;
export type CreateMiaProjectDto = CreateProjectDto;
export type UpdateMiaDatasetDto = UpdateDatasetDto;
export type UpdateMiaProjectDto = UpdateProjectDto;
export type DeleteAllMiaDto = DeleteAllDto;

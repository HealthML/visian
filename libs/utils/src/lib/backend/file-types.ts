import { MiaAnnotation, MiaImage } from "./mia";

export interface MiaAnnotationMetadata extends Partial<MiaAnnotation> {
  id: string;
  backend: "mia";
  kind: "annotation";
}

export interface MiaImageMetadata extends Partial<MiaImage> {
  id: string;
  backend: "mia";
  kind: "image";
}

export interface WhoAnnotationMetadata {
  id: string;
  backend: "who";
  kind: "annotation";
}

export interface DvAnnotationMetadata {
  id: string;
  backend: "dv";
  kind: "annotation";
}

export type MiaMetadata = MiaAnnotationMetadata | MiaImageMetadata;

export type WhoMetadata = WhoAnnotationMetadata;

export type DvMetadata = DvAnnotationMetadata;

export type BackendMetadata = MiaMetadata | WhoMetadata | DvMetadata;

export function isMiaAnnotationMetadata(
  metadata?: BackendMetadata,
): metadata is MiaAnnotationMetadata {
  return metadata?.backend === "mia" && metadata?.kind === "annotation";
}

export function isMiaImageMetadata(
  metadata?: BackendMetadata,
): metadata is MiaImageMetadata {
  return metadata?.backend === "mia" && metadata?.kind === "image";
}

export function isMiaMetadata(
  metadata?: BackendMetadata,
): metadata is MiaMetadata {
  return metadata?.backend === "mia";
}

export function isWhoAnnotationMetadata(
  metadata?: BackendMetadata,
): metadata is WhoAnnotationMetadata {
  return metadata?.backend === "who" && metadata?.kind === "annotation";
}

export function isDvAnnotationMetadata(
  metadata?: BackendMetadata,
): metadata is DvAnnotationMetadata {
  return metadata?.backend === "dv" && metadata?.kind === "annotation";
}

export interface FileWithMetadata extends File {
  metadata: BackendMetadata;
}

export interface FileWithAnnotationGroup extends File {
  annotationGroupId: string;
  metadata?: BackendMetadata;
}

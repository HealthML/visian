import type { ViewMode } from "@visian/ui-shared";
import type { ViewType } from "@visian/utils";

export type TrackingEventKind =
  | "SESSION_START"
  | "WINDOW_SIZE"
  | "ACTIVE_DOCUMENT"
  | "ACTIVE_LAYER"
  | "VIEW_TYPE"
  | "VIEW_SLICE"
  | "POINTER_MOVE"
  | "POINTER_DOWN"
  | "SESSION_END";

export interface TrackingEvent {
  kind: TrackingEventKind;

  /** The date and time when this event occurred as the number of milliseconds elapsed since the UNIX epoch. */
  at: number;
}

export interface SessionTrackingEvent extends TrackingEvent {
  kind: "SESSION_START" | "SESSION_END";
}

export interface WindowTrackingEvent extends TrackingEvent {
  kind: "WINDOW_SIZE";

  innerWidth: number;
  innerHeight: number;
}

export interface ActiveDocumentTrackingEvent extends TrackingEvent {
  kind: "ACTIVE_DOCUMENT";

  id?: string;
  title?: string;
}

export interface ActiveLayerTrackingEvent extends TrackingEvent {
  kind: "ACTIVE_LAYER";

  id?: string;
  title?: string;
}

export interface ViewTypeTrackingEvent extends TrackingEvent {
  kind: "VIEW_TYPE";

  viewMode: ViewMode;
  mainViewType?: ViewType;
  hoveredViewType?: ViewType;
}

export interface ViewSliceTrackingEvent extends TrackingEvent {
  kind: "VIEW_SLICE";

  viewType: ViewType;
  slice: number;
}

export interface PointerTrackingEvent extends TrackingEvent {
  kind: "POINTER_MOVE" | "POINTER_DOWN";

  clientX: number;
  clientY: number;

  u?: number;
  v?: number;

  voxelX?: number;
  voxelY?: number;
  voxelZ?: number;
}

export type TrackingLog = (
  | SessionTrackingEvent
  | WindowTrackingEvent
  | ActiveDocumentTrackingEvent
  | ActiveLayerTrackingEvent
  | ViewTypeTrackingEvent
  | ViewSliceTrackingEvent
  | PointerTrackingEvent
)[];

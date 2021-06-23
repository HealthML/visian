import { IDocument, IMarkers, MarkerConfig } from "@visian/ui-shared";
import { ViewType } from "@visian/utils";

export class Markers implements IMarkers {
  public readonly excludeFromSnapshotTracking = ["document"];

  constructor(protected document: IDocument) {}

  public getSliceMarkers(viewType: ViewType): MarkerConfig[] {
    const markers: MarkerConfig[] = [];
    // We cannot use a simple `map` & `flat` because this would also flatten
    // (& split) range markers in the form `[start, end]`
    [...this.document.layers].reverse().forEach((layer) => {
      layer.getSliceMarkers(viewType).forEach((marker) => {
        markers.push(marker);
      });
    });
    return markers;
  }
}

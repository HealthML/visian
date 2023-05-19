import { ViewType } from "@visian/utils";

export class AxesViewDescription {
  public static fromViewType(viewType: ViewType) {
    switch (viewType) {
      case ViewType.Sagittal:
        return new AxesViewDescription("S", "P", "I", "A");
      case ViewType.Coronal:
        return new AxesViewDescription("S", "L", "I", "R");
      case ViewType.Transverse:
        return new AxesViewDescription("A", "L", "P", "R");
    }
  }
  constructor(
    public top: string,
    public right: string,
    public bottom: string,
    public left: string,
  ) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }
}

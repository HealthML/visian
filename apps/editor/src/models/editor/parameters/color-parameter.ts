import { IColorParameter } from "@visian/ui-shared";

import { Parameter } from "./parameter";

export class ColorParameter
  extends Parameter<string>
  implements IColorParameter
{
  public static readonly kind = "color";
  public readonly kind = "color";
}

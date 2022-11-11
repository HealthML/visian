import { IStringParameter } from "@visian/ui-shared";

import { Parameter } from "./parameter";

export class StringParameter
  extends Parameter<string>
  implements IStringParameter
{
  public static readonly kind = "string";
  public readonly kind = "string";
}

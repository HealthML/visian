import { IBooleanParameter } from "@visian/ui-shared";
import { Parameter } from "./parameter";

export class BooleanParameter
  extends Parameter<boolean>
  implements IBooleanParameter {
  public static readonly kind = "bool";
  public readonly kind = "bool";
}

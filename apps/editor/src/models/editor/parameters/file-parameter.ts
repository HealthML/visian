import { IFileParameter } from "@visian/ui-shared";
import { Parameter } from "./parameter";

export class FileParameter
  extends Parameter<File | undefined>
  implements IFileParameter {
  public static readonly kind = "file";
  public readonly kind = "file";
}

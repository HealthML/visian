import { IButtonParameter } from "@visian/ui-shared";

import { Parameter, ParameterConfig } from "./parameter";

export interface ButtonParameterConfig<T = void> extends ParameterConfig<T> {
  onClick?: (name: string, value: T) => void;
}

export class ButtonParameter<T = void>
  extends Parameter<T>
  implements IButtonParameter<T> {
  public static readonly kind = "button";
  public readonly kind = "button";

  public onClick?: (name: string, value: T) => void;

  constructor(config: ButtonParameterConfig<T>) {
    super(config);
    this.onClick = config.onClick;
  }

  public handleClick(): void {
    if (!this.onClick) return;
    this.onClick(this.name, this.value);
  }
}

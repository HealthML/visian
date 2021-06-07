import type React from "react";
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

  public onPress?: (
    name: string,
    value: T,
    event?: PointerEvent | React.PointerEvent,
  ) => void;

  constructor(config: ButtonParameterConfig<T>) {
    super(config);
    this.onPress = config.onClick;
  }

  public handlePress(event?: PointerEvent | React.PointerEvent): void {
    if (!this.onPress) return;
    this.onPress(this.name, this.value, event);
  }

  public toProps(): IButtonParameter<T> {
    return {
      ...(super.toProps() as Omit<IButtonParameter<T>, "handlePress">),
      handlePress: this.handlePress,
    };
  }
}

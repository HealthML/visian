import React from "react";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * If provided, switches out the rendered HTML tag.
   *
   * @see https://styled-components.com/docs/api#as-polymorphic-prop
   */
  as?: never;

}

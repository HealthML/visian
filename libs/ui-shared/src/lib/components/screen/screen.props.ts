import type { BoxProps } from "../box";

export interface ScreenProps extends BoxProps {
  /** The document title displayed in the browser tab. */
  title?: string;
}

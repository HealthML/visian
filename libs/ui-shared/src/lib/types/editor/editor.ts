import type { IDocument } from "./document";
import type { Theme } from "../../theme";

/** The state of VISIAN's annotation editor. */
export interface IEditor {
  /** The document the user is currently working on. */
  activeDocument?: IDocument;

  /** Proxy for the root store refs. */
  refs: { [name: string]: React.RefObject<HTMLElement> };

  /** Proxy for the root store theme. */
  theme: Theme;
}

export interface ProgressPopUpProps {
  label?: string;
  labelTx?: string;

  /**
   * A [0,1]-ranged number indicating the current progress.
   * If none is given, an indeterminate progress indicator will be displayed.
   */
  progress?: number;
}

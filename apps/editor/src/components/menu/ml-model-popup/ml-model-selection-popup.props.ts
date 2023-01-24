import type { StatefulPopUpProps } from "@visian/ui-shared";


export interface ModelPopUpProps extends StatefulPopUpProps{
    getSelectedImageList: () => void;
}

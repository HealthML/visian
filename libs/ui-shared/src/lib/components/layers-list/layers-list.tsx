import styled from "styled-components";

import { ILayer } from "../../types";
import { List, ListItem } from "../list";

const LayersListStyled = styled(List)`
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  user-select: none;
  margin-bottom: 10px;
`;

const LayerItem = styled(ListItem)`
  height: 30px;
`;

export const LayerList = ({
  layers,
  sort,
}: {
  layers?: ILayer[];
  sort?: (layer1: ILayer, layer2: ILayer) => number;
}) => (
  <LayersListStyled>
    {(layers ?? [])
      .sort(
        sort ??
          ((layer1, layer2) => {
            if (!layer1.title || !layer2.title) {
              return 0;
            }
            if (layer1.title < layer2.title) {
              return -1;
            }
            if (layer1.title > layer2.title) {
              return 1;
            }
            return 0;
          }),
      )
      .map((layer) => (
        <LayerItem
          key={layer.id}
          label={layer.title}
          isLast
          icon={{
            color: layer.color ?? "text",
          }}
        />
      ))}
  </LayersListStyled>
);

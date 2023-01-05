import { Box, Screen } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { DatasetModal } from "../components/menu/dataset-modal";
import { getDatasetFormDatabase } from "../components/menu/hub-actions";
import { Dataset } from "../types";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 5rem 10rem;
`;

export const DatasetScreen: React.FC = observer(() => {
  const [dataset, setDataset] = useState<Dataset>();

  // fetch dataset
  useEffect(() => {
    (async () => setDataset(await getDatasetFormDatabase()))();
  }, []);

  if (!dataset?.images) {
    return (
      <Screen title="VISIAN Projects">
        <Main>Loading...</Main>
      </Screen>
    );
  }

  return (
    <Screen title="VISIAN Projects">
      <Main>
        <DatasetModal
          dataset={dataset}
          deleteDocuments={() => {
            console.log("foo");
          }}
        />
      </Main>
    </Screen>
  );
});

export default DatasetScreen;

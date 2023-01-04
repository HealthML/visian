import { Box, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { DatasetModal } from "../components/menu/dataset-modal";
import {
  deleteDocumentFromDatabase,
  getDatasetFormDatabase,
} from "../components/menu/hub-actions";
import { Dataset, DocumentItem } from "../types";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 5rem 10rem;
`;

export const DatasetScreen: React.FC = observer(() => {
  const [, { onDrop, ...dragListeners }] = useIsDraggedOver();

  const [dataset, setDataset] = useState([] as Dataset);

  // fetch dataset
  useEffect(() => {
    (async () => setDataset(await getDatasetFormDatabase()))();
  }, []);

  const deleteDocuments = useCallback((ids: string[]) => {
    const deletedIds = ids.filter((id) => deleteDocumentFromDatabase(id));
    setDataset((prevDataset: Dataset) =>
      prevDataset.filter(
        (document: DocumentItem) => !deletedIds.includes(document.id),
      ),
    );
  }, []);

  return (
    <Screen {...dragListeners} title="VISIAN Projects">
      <Main>
        <DatasetModal dataset={dataset} deleteDocuments={deleteDocuments} />
      </Main>
    </Screen>
  );
});

export default DatasetScreen;

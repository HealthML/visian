import { Dataset, DocumentItem } from "../components/menu/data-types";

const path = "https://webhook.site/faaa6131-98ba-4007-9623-e4af82e3580c";

// fetches Dataset from Database
export const getDatasetFormDatabase = async () => {
  let dataset: Dataset = [];
  await fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then((data) =>
      data.map((document: DocumentItem) => ({
        ...document,
        props: { isSelected: false, showAnnotations: false },
      })),
    )
    .then((data) => {
      dataset = data;
    });
  return dataset;
};

// returns true if Document is succsessfully deleted from Database
export const deleteDocumentFromDatabase = async (id: string) => true;

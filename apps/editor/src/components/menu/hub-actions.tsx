import { Dataset, DocumentItem } from "../../types/dataset-types";

const path = "https://webhook.site/b9c9c6a8-7804-4477-869e-dc6cec7ba8ba";

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
        props: { isSelected: false },
      })),
    )
    .then((data) => {
      dataset = data;
    });
  return dataset;
};

// returns true if Document is succsessfully deleted from Database
export const deleteDocumentFromDatabase = async (id: string) => true;

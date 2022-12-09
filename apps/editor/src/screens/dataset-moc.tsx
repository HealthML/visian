import { Dataset } from "../components/menu/data-types";

const path = "https://webhook.site/faaa6131-98ba-4007-9623-e4af82e3580c";

export const getDataset = async () => {
  let dataset: Dataset = [];
  await fetch(path)
    .then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then((data) => {
      dataset = data;
    });
  return dataset;
};
